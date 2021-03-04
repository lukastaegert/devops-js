export class TerminalServerConnection {
  constructor(onMessage, onError) {
    this._onMessage = onMessage;
    this._onError = onError;
    this._waitingCommands = [];
  }

  sendCommand(command) {
    if (this._client && this._client.readyState) {
      this._client.send(command);
    } else {
      this._waitingCommands.push(command);
      if (!this._client) {
        this._createSocket();
      }
    }
  }

  _createSocket() {
    this._client = new WebSocket('ws://localhost:9000');
    this._client.addEventListener('open', this._handleOpenConnection.bind(this), { once: true });
    this._client.addEventListener('close', this._handleClose.bind(this), { once: true });
    this._client.addEventListener('error', this._onError);
  }

  _handleOpenConnection() {
    console.log('terminal-server-connected');
    this._client.addEventListener('message', this._handleMessage.bind(this));
    for (const command of this._waitingCommands) {
      this._client.send(command);
    }
    this._waitingCommands.length = 0;
  }

  _handleMessage(message) {
    console.log('terminal-server-message', message.data);
    this._onMessage(JSON.parse(message.data));
  }

  _handleClose() {
    console.log('terminal-server-connection-lost');
    this._client = null;
  }
}
