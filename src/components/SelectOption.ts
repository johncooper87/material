import customElement from '../internals/customElement';
import InteractiveElement from './base/InteractiveElement';
import RippleEffect from './base/RippleEffect';
//import Select from './Select';
import template from './SelectOption.html';

@customElement('md-option')
export default class SelectOption extends InteractiveElement {

  //private selectEl: Select;
  private labelEl: HTMLSpanElement;
  private _value: string = '';
  private _label: string = '';

  constructor() {
    super();

    new RippleEffect(this);
    this.shadowRoot.appendChild(template.fragment);
    this.labelEl = this.shadowRoot.querySelector('label');
    this.addEventListener('click', this.handleClick);
  }

  connectedCallback() {
    this.focusableEl.tabIndex = -1;
  }

  static get observedAttributes() {
    return ['label', 'value'];
  }
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    super.attributeChangedCallback(name, oldValue, newValue);
    switch (name) {
      case 'label':
        this._label = newValue;
        this.labelEl.innerText = newValue;
        break;
      case 'value':
        this._value = newValue;
        break;
    }
  }

  private handleClick(event: Event) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent('select', { bubbles: true, cancelable: true, composed: true }));
  }

  get label(): string {
    return this._label;
  }
  set label(value: string) {
    this.setAttribute('label', value);
  }

  get value(): string {
    return this._value;
  }
  set value(value: string) {
    this.setAttribute('value', value);
  }
}