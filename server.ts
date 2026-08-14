import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Server-side Gemini Client
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Chat API endpoint for Driver Logistics & Rescheduling Assistant
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history, activeShipment, driverProfile } = req.body;

      const ai = getGeminiClient();

      if (ai) {
        const systemInstruction = `You are FleetPulse AI Dispatcher & Driver Assistant, a helpful voice and text co-pilot for commercial truck drivers.
Your goal is to assist driver ${driverProfile?.name || 'Driver'} (ID: ${driverProfile?.id || 'DRV-4029'}) on the road.

Current Active Shipment context:
${
  activeShipment
    ? `- Shipment ID: ${activeShipment.id}
- Status: ${activeShipment.status}
- Cargo: ${activeShipment.cargoDescription} (${activeShipment.cargoWeight})
- Pickup: ${activeShipment.pickupLocation?.facilityName} in ${activeShipment.pickupLocation?.cityState} (Scheduled: ${activeShipment.pickupLocation?.scheduledTime})
- Delivery: ${activeShipment.deliveryLocation?.facilityName} in ${activeShipment.deliveryLocation?.cityState} (Scheduled ETA: ${activeShipment.deliveryLocation?.updatedEta || activeShipment.deliveryLocation?.scheduledEta})
- Current Location: ${activeShipment.currentLocationName}
- Remaining Distance: ${activeShipment.remainingDistanceMiles} miles`
    : 'No active shipment currently assigned.'
}

Instructions:
1. Provide concise, professional, driver-friendly advice tailored for logistics, route safety, dock protocols, and rescheduling.
2. If the driver indicates an issue, delay, traffic, mechanical breakdown, dock queue, or explicitly requests to RESCHEDULE a pickup or delivery, guide them clearly and provide a suggested action card format at the end of your text response in JSON format.
3. If they ask for rescheduling or logging an issue, include a special JSON block at the very end of your response inside triple backticks like:
\`\`\`action
{
  "actionType": "RESCHEDULE_OR_ISSUE",
  "category": "TRAFFIC" | "BREAKDOWN" | "DOCK_DELAY" | "WEATHER" | "GATE_ACCESS" | "INSPECTION" | "CUSTOMER_UNAVAILABLE" | "OTHER",
  "title": "Short title like 'Delivery Reschedule Request'",
  "description": "Detailed description of the issue or new requested time",
  "estimatedDelayMinutes": 45,
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "suggestedNewEta": "e.g. Today 06:30 PM (+45m)"
}
\`\`\`
Only include the \`\`\`action block if the driver wants to log an issue or reschedule. Keep conversational tone friendly, brief, and clear.`;

        const contents = [];
        if (Array.isArray(history)) {
          for (const item of history) {
            contents.push({
              role: item.role === 'user' ? 'user' : 'model',
              parts: [{ text: item.text }],
            });
          }
        }
        contents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        return res.json({ text: response.text || 'Copy that, driver. How else can dispatch assist you today?' });
      }

      // Fallback response if GEMINI_API_KEY is not configured
      const lowerMsg = (message || '').toLowerCase();
      let responseText = `Copy that, driver! I'm FleetPulse Dispatch Co-pilot. `;
      let actionObj = null;

      if (lowerMsg.includes('reschedule') || lowerMsg.includes('eta') || lowerMsg.includes('late') || lowerMsg.includes('delay')) {
        responseText += `I can process a rescheduling request for shipment ${activeShipment?.id || 'SHP-89241'}. I will log a 45-minute delay note and notify the receiving facility dock manager.`;
        actionObj = {
          actionType: 'RESCHEDULE_OR_ISSUE',
          category: 'TRAFFIC',
          title: 'Reschedule & Delay Request',
          description: `Driver requested rescheduling due to route conditions (${message}).`,
          estimatedDelayMinutes: 45,
          severity: 'MEDIUM',
          suggestedNewEta: `${activeShipment?.deliveryLocation?.scheduledEta || '18:00'} (+45m Delay)`,
        };
      } else if (lowerMsg.includes('breakdown') || lowerMsg.includes('flat') || lowerMsg.includes('engine') || lowerMsg.includes('repair')) {
        responseText += `Safety first! I am logging a Critical Mechanical Breakdown alert for dispatch and requesting emergency roadside assistance to your location (${activeShipment?.currentLocationName || 'Current GPS Route'}).`;
        actionObj = {
          actionType: 'RESCHEDULE_OR_ISSUE',
          category: 'BREAKDOWN',
          title: 'Mechanical Breakdown Alert',
          description: `Vehicle maintenance issue reported: ${message}`,
          estimatedDelayMinutes: 120,
          severity: 'CRITICAL',
          suggestedNewEta: 'Pending Roadside Assistance',
        };
      } else if (lowerMsg.includes('dock') || lowerMsg.includes('gate') || lowerMsg.includes('detention') || lowerMsg.includes('waiting')) {
        responseText += `Noted dock detention/access delay. Dispatch will log detention time starting now to ensure accurate driver compensation and notify facility managers.`;
        actionObj = {
          actionType: 'RESCHEDULE_OR_ISSUE',
          category: 'DOCK_DELAY',
          title: 'Facility Dock Detention Delay',
          description: `Driver delayed at loading/unloading dock: ${message}`,
          estimatedDelayMinutes: 60,
          severity: 'MEDIUM',
          suggestedNewEta: `${activeShipment?.deliveryLocation?.scheduledEta || 'Today'} (+1h Dock Delay)`,
        };
      } else if (lowerMsg.includes('status') || lowerMsg.includes('load') || lowerMsg.includes('where') || lowerMsg.includes('info')) {
        if (activeShipment) {
          responseText += `Active Load ${activeShipment.id}: Traveling to ${activeShipment.deliveryLocation.facilityName} in ${activeShipment.deliveryLocation.cityState}. Remaining: ${activeShipment.remainingDistanceMiles} miles. Scheduled Delivery: ${activeShipment.deliveryLocation.updatedEta || activeShipment.deliveryLocation.scheduledEta}.`;
        } else {
          responseText += `You currently have no active shipment assigned. Check the 'Accept Loads' tab to accept available hauls!`;
        }
      } else {
        responseText += `I'm standing by to assist with shipment rescheduling, traffic updates, breakdown alerts, or dispatch questions. Type what you need or pick an option below.`;
      }

      if (actionObj) {
        responseText += `\n\n\`\`\`action\n${JSON.stringify(actionObj, null, 2)}\n\`\`\``;
      }

      return res.json({ text: responseText });
    } catch (err: any) {
      console.error('Chat error:', err);
      return res.status(500).json({ error: 'Failed to process chat message', details: err.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FleetPulse Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
