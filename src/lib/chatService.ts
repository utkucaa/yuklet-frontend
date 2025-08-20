import SockJS from 'sockjs-client';

export interface ChatMessage {
  id?: string;
  sender: string;
  content: string;
  timestamp: string;
  conversationId: number;
}

export interface ChatServiceConfig {
  wsUrl?: string;
  reconnectDelay?: number;
  connectionTimeout?: number;
}

// Simple type definitions to avoid namespace issues
interface StompMessage {
  body: string;
}

interface StompSubscription {
  unsubscribe: () => void;
}

interface StompClient {
  connected: boolean;
  onConnect: ((frame?: unknown) => void) | null;
  onStompError: ((frame: unknown) => void) | null;
  onWebSocketClose?: ((evt: CloseEvent) => void) | null;
  activate: () => void;
  subscribe: (destination: string, callback: (message: StompMessage) => void) => StompSubscription;
  publish: (options: { destination: string; body: string }) => void;
  deactivate: () => void;
}

export class ChatService {
  private client: StompClient | null = null;
  private currentSubscription: StompSubscription | null = null;
  private wsUrl: string;
  private connectionTimeout: number;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;
  private isConnecting: boolean = false;
  private connectionTimer: NodeJS.Timeout | null = null;
  private onMessageCallback?: (message: ChatMessage) => void;
  private onConnectionChangeCallback?: (connected: boolean) => void;
  private onErrorCallback?: (error: string) => void;

  constructor(config: ChatServiceConfig = {}) {

    const apiUrl = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_URL || 'http://localhost:8080/api';
    let origin: string;
    try {
      origin = new URL(apiUrl, window.location.origin).origin;
    } catch {
      origin = window.location.origin;
    }
    const defaultSockEndpoint = `${origin}/chat`;
    this.wsUrl = config.wsUrl || defaultSockEndpoint;
    this.connectionTimeout = config.connectionTimeout || 10000; // 10 seconds
  }

  public connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        resolve();
        return;
      }

      if (this.client?.connected) {
        resolve();
        return;
      }

      this.isConnecting = true;
      this.reconnectAttempts = 0;

      this.connectionTimer = setTimeout(() => {
        this.isConnecting = false;
        this.cleanup();
        const error = new Error(`Connection timeout after ${this.connectionTimeout}ms`);
        this.onErrorCallback?.(error.message);
        reject(error);
      }, this.connectionTimeout);

      try {
        const sock = new SockJS(this.wsUrl);

        import('@stomp/stompjs')
          .then((stompModule) => {
            const { Client } = stompModule as unknown as { Client: new (config: Record<string, unknown>) => StompClient };
            const client = new Client({
              webSocketFactory: () => sock,
              connectHeaders: { Authorization: `Bearer ${token}` },
              debug: () => {},
              reconnectDelay: 0,
            }) as unknown as StompClient;

            this.client = client;

            client.onConnect = () => {
              console.log('WebSocket connected successfully');
              this.isConnecting = false;
              this.reconnectAttempts = 0;
              if (this.connectionTimer) {
                clearTimeout(this.connectionTimer);
                this.connectionTimer = null;
              }
              this.onConnectionChangeCallback?.(true);
              resolve();
            };

            client.onStompError = (frame) => {
              console.error('STOMP error:', frame);
              this.isConnecting = false;
              this.cleanup();
              const errorMessage = 'STOMP bağlantı hatası';
              this.onErrorCallback?.(errorMessage);
              reject(new Error(errorMessage));
            };

            if ('onWebSocketClose' in client) {
              client.onWebSocketClose = () => {
                if (!this.isConnecting) return;
                this.isConnecting = false;
                this.cleanup();
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                  this.reconnectAttempts++;
                  setTimeout(() => {
                    this.connect(token).then(resolve).catch(reject);
                  }, 2000 * this.reconnectAttempts);
                } else {
                  const errorMessage = `Failed to connect after ${this.maxReconnectAttempts} attempts`;
                  this.onErrorCallback?.(errorMessage);
                  reject(new Error(errorMessage));
                }
              };
            }

            client.activate();
          })
          .catch((error) => {
            console.error('Failed to load STOMP client:', error);
            this.isConnecting = false;
            this.cleanup();
            const errorMessage = 'Failed to load WebSocket client library';
            this.onErrorCallback?.(errorMessage);
            reject(new Error(errorMessage));
          });
      } catch (error) {
        console.error('Connection setup error:', error);
        this.isConnecting = false;
        this.cleanup();
        const errorMessage = 'Failed to initialize WebSocket connection';
        this.onErrorCallback?.(errorMessage);
        reject(new Error(errorMessage));
      }
    });
  }

  private cleanup(): void {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
  }

  public subscribeToConversation(conversationId: number): void {
    if (!this.client?.connected) {
      console.warn('Client not connected, cannot subscribe');
      this.onErrorCallback?.('Not connected to chat server');
      return;
    }

    this.unsubscribeFromCurrent();

    const topic = `/topic/conversation-${conversationId}`;
    console.log(`Subscribing to topic: ${topic}`);

    try {
      this.currentSubscription = this.client.subscribe(topic, (message: StompMessage) => {
        try {
          const payload = JSON.parse(message.body);
          const chatMessage: ChatMessage = {
            id: payload.id || Date.now().toString(),
            sender: payload.sender,
            content: payload.content,
            timestamp: payload.timestamp || new Date().toISOString(),
            conversationId: conversationId,
          };
          this.onMessageCallback?.(chatMessage);
        } catch (error) {
          console.error('Error parsing message:', error);
          this.onErrorCallback?.('Invalid message format received');
        }
      });
    } catch (error) {
      console.error('Error subscribing to conversation:', error);
      this.onErrorCallback?.('Failed to subscribe to conversation');
    }
  }

  public unsubscribeFromCurrent(): void {
    if (this.currentSubscription) {
      try {
        this.currentSubscription.unsubscribe();
        this.currentSubscription = null;
        console.log('Unsubscribed from current conversation');
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    }
  }

  public sendMessage(conversationId: number, content: string): void {
    if (!this.client?.connected) {
      console.warn('Client not connected, cannot send message');
      this.onErrorCallback?.('Not connected to chat server');
      return;
    }

    if (!content.trim()) {
      return;
    }

    const destination = `/chat/sendTo/conversation-${conversationId}`;
    const message = {
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      this.client.publish({
        destination,
        body: JSON.stringify(message),
      });
      console.log('Message sent to:', destination);
    } catch (error) {
      console.error('Error sending message:', error);
      this.onErrorCallback?.('Failed to send message');
    }
  }

  public disconnect(): void {
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.cleanup();
    this.unsubscribeFromCurrent();
    
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (error) {
        console.error('Error during disconnect:', error);
      }
      this.client = null;
    }
    
    this.onConnectionChangeCallback?.(false);
    console.log('Chat service disconnected');
  }

  public isConnected(): boolean {
    return this.client?.connected || false;
  }

  public onMessage(callback: (message: ChatMessage) => void): void {
    this.onMessageCallback = callback;
  }

  public onConnectionChange(callback: (connected: boolean) => void): void {
    this.onConnectionChangeCallback = callback;
  }

  public onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }
}

export const chatService = new ChatService();
