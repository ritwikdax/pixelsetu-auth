import { EventEmitter } from 'events';


// Event names constants
export const APP_EVENTS = {
    LOGIN_FAILED: 'login:failed',
    SELECTION_SUBMITTED: 'selection:submitted',
} as const;


class AppEventEmitter extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(20);
    }

    /**
     * Emit a typed event
     * @param event - Event name
     * @param data - Event data
     */
    emitEvent<T>(event: string, data: T): boolean {
        return this.emit(event, data);
    }

    /**
     * Listen to a typed event
     * @param event - Event name
     * @param listener - Event listener callback
     */
    onEvent<T>(event: string, listener: (data: T) => void): this {
        return this.on(event, listener);
    }
}

// Singleton instance
export const appEventEmitter = new AppEventEmitter();
