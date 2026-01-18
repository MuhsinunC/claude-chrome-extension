/**
 * Claude Chrome Extension - Custom Configuration
 *
 * Edit this file to customize your Claude extension settings.
 * After making changes, reload the extension in chrome://extensions
 */

window.CLAUDE_CONFIG = {
  /**
   * Custom API Endpoint URL
   *
   * Set this to your custom API endpoint if you want to use a
   * different server instead of the default Anthropic API.
   *
   * Examples:
   *   - "https://your-proxy.example.com" (your own proxy)
   *   - "http://localhost:8080" (local development server)
   *   - "" or null (use default Anthropic API)
   *
   * Your endpoint should be compatible with the Anthropic API format.
   */
  apiEndpoint: "",

  /**
   * Custom WebSocket Endpoint URL (for streaming)
   *
   * Set this if your custom API also needs a different WebSocket URL.
   * Leave empty to derive from apiEndpoint automatically.
   */
  wsEndpoint: "",
};
