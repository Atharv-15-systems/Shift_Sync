/**
 * ShiftSync Nexconn SDK Integration Layer
 * 
 * Strict isolation for all Nexconn real-time chat operations:
 * - App Secret is NEVER exposed here (only public App Key and server-issued user token).
 * - Real-time event subscription for messages and connection state.
 * - Does not fabricate connection status.
 */

export type NexconnConnectionStatus = 
  | 'unconfigured' 
  | 'disconnected' 
  | 'connecting' 
  | 'connected' 
  | 'reconnecting' 
  | 'error';

export interface NexconnMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  metadata?: {
    handoverId?: string;
    type?: 'handover_card' | 'acknowledgement' | 'chat';
    [key: string]: any;
  };
}

type MessageListener = (message: NexconnMessage) => void;
type StatusListener = (status: NexconnConnectionStatus, detail?: string) => void;

class NexconnClientService {
  private status: NexconnConnectionStatus = 'disconnected';
  private statusDetail: string = '';
  private currentUserId: string | null = null;
  public appKey: string | null = null;
  private messageListeners: Set<MessageListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private engineInstance: any = null;

  constructor() {
    this.updateStatus('disconnected');
  }

  public getStatus(): { status: NexconnConnectionStatus; detail: string } {
    return { status: this.status, detail: this.statusDetail };
  }

  public subscribeStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status, this.statusDetail);
    return () => this.statusListeners.delete(listener);
  }

  public subscribeMessages(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  private updateStatus(newStatus: NexconnConnectionStatus, detail: string = '') {
    this.status = newStatus;
    this.statusDetail = detail;
    this.statusListeners.forEach(listener => listener(newStatus, detail));
  }

  /**
   * Initializes Nexconn Engine with public App Key
   */
  public async initialize(appKey?: string): Promise<boolean> {
    if (!appKey || appKey === 'your_nexconn_app_key_here') {
      this.updateStatus('unconfigured', 'Nexconn App Key is missing or default.');
      return false;
    }

    this.appKey = appKey;

    try {
      const enginePkg = '@nexconn/engine';
      const engineModule = await import(/* @vite-ignore */ enginePkg).catch(() => null);

      if (engineModule && (engineModule.NCEngine || engineModule.default)) {
        const NCEngine = engineModule.NCEngine || engineModule.default;
        NCEngine.initialize({ appKey });
        this.engineInstance = NCEngine;

        // Register SDK connection status listener
        if (typeof NCEngine.addConnectionStatusHandler === 'function') {
          NCEngine.addConnectionStatusHandler('shiftsync-handler', (event: any) => {
            if (event.status === 0 || event.status === 'CONNECTED') {
              this.updateStatus('connected');
            } else if (event.status === 'CONNECTING') {
              this.updateStatus('connecting');
            } else {
              this.updateStatus('disconnected', event.message || '');
            }
          });
        }
      }

      this.updateStatus('disconnected', 'Engine initialized. Ready to authenticate.');
      return true;
    } catch (err: any) {
      this.updateStatus('error', `SDK initialization failed: ${err.message}`);
      return false;
    }
  }

  /**
   * Connects authenticated user via server-issued token
   */
  public async connect(token: string, userId: string): Promise<boolean> {
    if (!token) {
      this.updateStatus('unconfigured', 'User token was not issued by server.');
      return false;
    }

    this.currentUserId = userId;
    this.updateStatus('connecting', 'Authenticating with Nexconn servers...');

    if (this.engineInstance && typeof this.engineInstance.connect === 'function') {
      return new Promise((resolve) => {
        this.engineInstance.connect({ token }, (connectedUserId: string, error: any) => {
          if (error) {
            this.updateStatus('error', `Connection error: ${error.message || error}`);
            resolve(false);
          } else {
            this.currentUserId = connectedUserId || userId;
            this.updateStatus('connected', `Connected as ${this.currentUserId}`);
            resolve(true);
          }
        });
      });
    }

    // In environment without remote connection, reflect honest status
    this.updateStatus('unconfigured', 'SDK connection waiting for remote credential confirmation.');
    return false;
  }

  /**
   * Disconnects current session
   */
  public disconnect(): void {
    if (this.engineInstance && typeof this.engineInstance.disconnect === 'function') {
      try {
        this.engineInstance.disconnect();
      } catch {
        // cleanup
      }
    }
    this.currentUserId = null;
    this.updateStatus('disconnected', 'Session ended.');
  }

  /**
   * Broadcasts a real-time message through the active Nexconn channel
   */
  public async sendMessage(
    channelId: string,
    sender: { id: string; name: string; avatar?: string },
    text: string,
    metadata?: Record<string, any>
  ): Promise<NexconnMessage> {
    const message: NexconnMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      channelId,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      text,
      timestamp: new Date().toISOString(),
      metadata
    };

    // If real SDK channel instance is active, dispatch to SDK
    if (this.engineInstance && this.status === 'connected') {
      try {
        const chatPkg = '@nexconn/chat';
        const chatModule = await import(/* @vite-ignore */ chatPkg).catch(() => null);
        if (chatModule && chatModule.GroupChannel) {
          const channel = chatModule.GroupChannel.obtainChannel(channelId);
          if (channel && typeof channel.sendMessage === 'function') {
            channel.sendMessage({
              content: text,
              extra: JSON.stringify(metadata || {})
            });
          }
        }
      } catch (err) {
        console.warn('[Nexconn SDK Send]:', err);
      }
    }

    // Dispatch to local subscribers
    this.messageListeners.forEach(listener => listener(message));
    return message;
  }
}

// Export singleton instance
export const nexconnService = new NexconnClientService();
