const modalContent = document.createElement("template");
modalContent.innerHTML = `
    <button>Close</button>
    
    <fieldset>
        <legend>User obtained randomly from https://jsonplaceholder.typicode.com/</legend>
        <h1></h1>
        <a target="_blank"></a>
        <p></p>
    </fieldset>`;

class MyCustomModal extends HTMLElement {
  static get observedAttributes() {
    return ["button-label"];
  }

  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this._modal = null;
    this._modalShield = null;
    this._closeButton = null;
    this._isOpen = false;
  }

  connectedCallback() {
    fetch(`https://jsonplaceholder.typicode.com/users/`)
      .then((response) => response.json())
      .then((json) => {
        this._root.querySelector(".list").innerHTML = "";
        json.slice(0, 5).forEach((element) => {
          this._root.querySelector(
            ".list"
          ).innerHTML += `<p><a target="_blank" href="https://jsonplaceholder.typicode.com/users/${element.id}">${element.name}</a></p>`;
        });
      });

    this._root.innerHTML = `
        <style>
            .modal {
                background-color: #fff;
                border-radius: 10px;
                color: #333;
                height: 480px;
                left: 50%;
                max-height: 60%;
                max-width: 80%;
                opacity: 1;
                padding: 20px;
                position: fixed;
                top: 50%;
                transform: translate(-50%, -50%);
                width: 640px;
                z-index: 102;
            }
            .modal-shield {
                background-color: #000;
                content: '';
                height: 100vh;
                left: 0;
                opacity: .2;
                position: fixed;
                top: 0;
                width: 100vw;
                z-index: 101;
            }
        </style>
        <button class="btn btn-primary">${this.getAttribute(
          "button-label"
        )}</button>

        <fieldset>
            <legend>Content from the reactive web app</legend>
            <slot></slot>
        </fieldset>

        <fieldset>
            <legend>Obtained from https://jsonplaceholder.typicode.com/</legend>
            <div class="list">Loading...</div>
        </fieldset>
    `;

    this._root.querySelector("button").addEventListener("click", (e) => {
      this.isOpen = true;
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log("Attribute changed", name, oldValue, newValue);
  }

  disconnectedCallback() {
    console.log("My custom element removed from the DOM");
  }

  createModal() {
    this._modalShield = document.createElement("div");
    this._modalShield.classList.add("modal-shield");
    this._root.appendChild(this._modalShield);

    this._modal = document.createElement("div");
    this._modal.classList.add("modal");
    this._root.appendChild(this._modal);

    const random = Math.floor(Math.random() * 100 + 1);
    fetch(`https://jsonplaceholder.typicode.com/posts/${random}`)
      .then((response) => response.json())
      .then((json) => {
        this._modal.appendChild(modalContent.content.cloneNode(true));
        this._modal.querySelector("h1").innerText = json.title;
        this._modal.querySelector(
          "a"
        ).href = `https://jsonplaceholder.typicode.com/posts/${json.id}`;
        this._modal.querySelector(
          "a"
        ).innerText = `https://jsonplaceholder.typicode.com/posts/${json.id}`;
        this._modal.querySelector("p").innerText = json.body;
        this._modal.querySelector("button").addEventListener("click", () => {
          this.isOpen = false;
        });
      });
  }

  removeModal() {
    this._modal.remove();
    this._modalShield.remove();
  }

  set isOpen(state) {
    if (this._isOpen === state) return;
    this._isOpen = state;
    if (this._isOpen) {
      this.createModal();
    } else {
      this.removeModal();
    }
  }

  get isOpen() {
    return this._isOpen;
  }
}

window.customElements.define("my-custom-modal", MyCustomModal);
