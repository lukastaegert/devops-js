export class TerminalServerConnection {
  constructor(onMessage) {
    this._onMessage = onMessage;
    this._createSocket();
    this._waitingCommands = [];
  }

  sendCommand(command) {
    if (this._client && this._client.readyState) {
      this._client.send(command);
    } else {
      this._waitingCommands.push(command);
    }
  }

  _createSocket() {
    this._client = new WebSocket('ws://localhost:9000');
    this._client.addEventListener('open', this._handleOpenConnection.bind(this), { once: true });
    this._client.addEventListener('close', this._handleClose.bind(this), { once: true });
  }

  _handleOpenConnection() {
    console.log('terminal-server-connected');
    this._client.addEventListener('message', this._handleMessage.bind(this));
    for (const command of this._waitingCommands) {
      this._client.send(command);
    }
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
