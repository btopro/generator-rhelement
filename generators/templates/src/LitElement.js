/*
 * Copyright <%= year %> <%= copyrightOwner %>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { LitElement, html, property } from '@polymer/lit-element';

/**
 * `<%= elementName %>`
 *
 *
 * @customElement
 * @demo demo/index.html
 */
class <%= elementClassName %> extends <%= customElementClass %> {

  // Public property API that triggers re-render (synced with attributes)
  @property({ type: String })
  title = "<%= elementName %>";

  tag() {
    return "<%= elementName %>";
  },

  templateUrl() {
    return "<%= elementName %>.html";
  }

  styleUrl() {
  <% _ if (useSass) { _ %>
    return "<%= elementName %>.scss";
  <% _ } else { _ %>
    return "<%= elementName %>.css";
  <% _ } _ %>
  }

  // static get observedAttributes() {
  //   return [];
  // }

  constructor() {
    super(<%= elementClassName %>.tag);
  },

  // connectedCallback() {
  //   super.connectedCallback();
  // }

  // disconnectedCallback() {}

  // attributeChangedCallback(attr, oldValue, newValue) {}

  // Render method should return a `TemplateResult` using the provided lit-html `html` tag function
  render() {
    return html`
      <style>
        :host {
          display: block;
        }
        :host([hidden]) {
          display: none;
        }
      </style>
      <slot></slot>
    `;
  }
}
customElements.define(<%= elementClassName %>.tag, <%= elementClassName %>);