import { useSimulationStore } from '../store/simulationStore';
import { getBackendUrl } from '../utils/backendConfig';

// Start a polling loop outside of React hooks to avoid impacting hook ordering.
// Returns a stop function.
export function startSimulationPolling(pollInterval = 1500) {
  let mounted = true;
  const store = useSimulationStore;
  const BACKEND = getBackendUrl();

  async function tick() {
    if (!BACKEND) return;

    try {
      const state = store.getState();
      const { scenario, materialProfile, control, ingestTelemetry, clearControlCommand } = state;

      const response = await fetch(`${BACKEND}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario, material_profile: materialProfile, control, dt: 1.5 })
      });

      if (!response.ok || !mounted) return;
      const data = await response.json();
      ingestTelemetry(data);
      store.setState({ connectionError: null });
      if (control && control.command) {
        clearControlCommand();
      }
    } catch (err) {
      console.warn('[useSimulation] Poll failed:', err?.message || String(err));
      store.setState({ connectionError: err?.message || 'Polling failed' });
    }
  }

  // run immediately and then on interval
  tick();
  const id = setInterval(tick, pollInterval);

  return () => {
    mounted = false;
    clearInterval(id);
  };
}
