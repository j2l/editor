import BaseProperty from "./BaseProperty";
import { INPUT, LOAD } from "../../../../../util/Event";
import { html } from "../../../../../util/functions/func";
import { editor } from "../../../../../editor/editor";
import { Length } from "../../../../../editor/unit/Length";
import { EVENT } from "../../../../../util/UIElement";
import {
  CHANGE_SELECTION,
  CHANGE_ARTBOARD
} from "../../../../types/event";
import { EMPTY_STRING } from "../../../../../util/css/types";

const fields = ["margin", "padding"];
let styleKeys = [];
fields.forEach(field => {
  styleKeys.push(...["-top", "-bottom", "-left", "-right"].map(it => field + it));
});

export default class BoxModelProperty extends BaseProperty {
  getTitle() {
    return "Box Model";
  }

  [EVENT(CHANGE_ARTBOARD, CHANGE_SELECTION)]() {
    this.refresh();
  }

  getBody() {
    return html`
      <div class="property-item box-model-item" ref="$boxModelItem"></div>
    `;
  }

  templateInput(key, current) {

    var value = current[key] || Length.px(0)

    return `<input type="number" ref="$${key}" value="${value.value.toString()}" />`;
  }

  [LOAD("$boxModelItem")]() {
    var current = editor.selection.current;

    if (!current) return EMPTY_STRING;

    return html`
      <div>
        <div class="margin">
          <div data-value="top">
            ${this.templateInput("margin-top", current)}
          </div>
          <div data-value="bottom">
            ${this.templateInput("margin-bottom", current)}
          </div>
          <div data-value="left">
            ${this.templateInput("margin-left", current)}
          </div>
          <div data-value="right">
            ${this.templateInput("margin-right", current)}
          </div>
        </div>
        <div class="padding">
          <div data-value="top">
            ${this.templateInput("padding-top", current)}
          </div>
          <div data-value="bottom">
            ${this.templateInput("padding-bottom", current)}
          </div>
          <div data-value="left">
            ${this.templateInput("padding-left", current)}
          </div>
          <div data-value="right">
            ${this.templateInput("padding-right", current)}
          </div>
        </div>
        <div
          class="content"
          ref="$content"
          title="${current.width.toString()} x ${current.height.toString()}"
        ></div>
      </div>
    `;
  }

  [INPUT("$boxModelItem input")](e) {
    this.resetBoxModel();
  }

  resetBoxModel() {
    var data = {};

    styleKeys.forEach(key => {
      data[key] = Length.px(this.getRef("$", key).value);
    });

    var current = editor.selection.current;

    if (current) {
      current.reset(data);

      this.emit("refreshCanvas");
    }
  }

  [EVENT("setSize")]() {
    var current = editor.selection.current;

    if (current) {
      this.refs.$content.attr(
        "title",
        `${current.width.toString()} x ${current.height.toString()}`
      );
    }
  }
}
