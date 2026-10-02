import { describe, expect, test, vi } from 'vitest';
import emitter from '../emitter.js';
import { ExtensionManager } from './manager.js';

vi.mock('../database/index.js', () => ({
	default: vi.fn(),
}));

describe('registerHook', () => {
	test('unregisters an init handler from the event it was registered on', () => {
		// `registerHook` doesn't read any instance state before the hook callback runs, so the
		// private method can be exercised directly without going through the full extension load
		// pipeline (which needs a database, a message bus, etc).
		const manager = Object.create(ExtensionManager.prototype) as any;

		const unregisterFunctions = manager.registerHook(
			(register: { init: (event: string, handler: () => void) => void }) => {
				register.init('app.after', () => {});
			},
			'my-extension',
		);

		expect(emitter.countInitListeners('app.after')).toBe(1);

		for (const unregister of unregisterFunctions) {
			unregister();
		}

		expect(emitter.countInitListeners('app.after')).toBe(0);
	});
});
