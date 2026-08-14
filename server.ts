import 'dotenv/config';
import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { registerRoutes } from './server/routes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  registerRoutes(app);

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
Your goal is to assist driver ${driverProfile?.name || 'Driver'} (ID: ${driverProfile?.id || 'DRV-101'}) on the road.

Current Active Shipment context:
${
  activeShipment
    ? `- Shipment ID: ${activeShipment.id}
- Status: ${activeShipment.status}
- Cargo: ${activeShipment.productClass}
- Origin: ${activeShipment.originLabel}
- Destination: ${activeShipment.destinationFacility?.name} in ${activeShipment.destinationFacility?.city}
- Planned ETA: ${activeShipment.latestEtaUpdate?.declaredEta || activeShipment.plannedEta}`
    : 'No active shipment currently assigned.'
}

Instructions:
1. Provide concise, professional, driver-friendly advice tailored for logistics, route safety, dock protocols, and rescheduling.
2. If the driver indicates an issue, delay, traffic, mechanical breakdown, or explicitly requests to RESCHEDULE a pickup or delivery, guide them clearly and provide a suggested action card format at the end of your text response in JSON format.
3. If they ask for rescheduling or logging an issue, include a special JSON block at the very end of your response inside triple backticks like:
\`\`\`action
{
  "actionType": "RESCHEDULE_OR_ISSUE",
  "category": "traffic_delay" | "breakdown" | "late_departure" | "accident" | "other",
  "title": "Short title like 'Delivery Reschedule Request'",
  "description": "Detailed description of the issue or new requested time",
  "estimatedDelayMinutes": 45,
  "suggestedNewEta": "e.g. Today 06:30 PM (+45m)"
}
\`\`\`
The "category" value MUST be exactly one of: traffic_delay, breakdown, late_departure, accident, other — these are the only categories the dispatch system can record. Only include the \`\`\`action block if the driver wants to log an issue or reschedule. Keep conversational tone friendly, brief, and clear.`;

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
        responseText += `I can process a rescheduling request for shipment ${activeShipment?.id || 'your shipment'}. I will log a 45-minute delay note and notify the receiving facility dock manager.`;
        actionObj = {
          actionType: 'RESCHEDULE_OR_ISSUE',
          category: 'traffic_delay',
          title: 'Reschedule & Delay Request',
          description: `Driver requested rescheduling due to route conditions (${message}).`,
          estimatedDelayMinutes: 45,
          suggestedNewEta: `${activeShipment?.plannedEta || 'Today'} (+45m Delay)`,
        };
      } else if (lowerMsg.includes('breakdown') || lowerMsg.includes('flat') || lowerMsg.includes('engine') || lowerMsg.includes('repair')) {
        responseText += `Safety first! I am logging a Mechanical Breakdown alert for dispatch and requesting emergency roadside assistance.`;
        actionObj = {
          actionType: 'RESCHEDULE_OR_ISSUE',
          category: 'breakdown',
          title: 'Mechanical Breakdown Alert',
          description: `Vehicle maintenance issue reported: ${message}`,
          estimatedDelayMinutes: 120,
          suggestedNewEta: 'Pending Roadside Assistance',
        };
      } else if (lowerMsg.includes('dock') || lowerMsg.includes('gate') || lowerMsg.includes('detention') || lowerMsg.includes('waiting')) {
        responseText += `Noted dock detention/access delay. Dispatch will log detention time starting now to ensure accurate driver compensation and notify facility managers.`;
        actionObj = {
          actionType: 'RESCHEDULE_OR_ISSUE',
          category: 'late_departure',
          title: 'Facility Dock Detention Delay',
          description: `Driver delayed at loading/unloading dock: ${message}`,
          estimatedDelayMinutes: 60,
          suggestedNewEta: `${activeShipment?.plannedEta || 'Today'} (+1h Dock Delay)`,
        };
      } else if (lowerMsg.includes('status') || lowerMsg.includes('load') || lowerMsg.includes('where') || lowerMsg.includes('info')) {
        if (activeShipment) {
          responseText += `Active Load ${activeShipment.id}: Traveling to ${activeShipment.destinationFacility?.name} in ${activeShipment.destinationFacility?.city}. Planned ETA: ${activeShipment.latestEtaUpdate?.declaredEta || activeShipment.plannedEta}.`;
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
