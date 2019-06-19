import CanvasView from "../ui/view/CanvasView";
import ToolMenu from "../ui/view/ToolMenu";

import UIElement from "../../util/UIElement";
import { RESIZE, DEBOUNCE } from "../../util/Event";
import { RESIZE_WINDOW } from "../types/event";
import Inspector from "../ui/control/Inspector";
import FillPopup from "../ui/control/panel/property-editor/FillPopup";

import ColorPicker from "../ui/control/panel/property-editor/ColorPicker";
import popup from "../ui/control/popup";

export default class CSSEditor extends UIElement {
  afterRender() {
    this.emit("setTargetElement", this.parent.opt.targetElement);
  }
  template() {
    if (this.props.embed) {
      return this.templateForEmbed();
    } else {
      return this.templateForEditor();
    }
  }

  templateForEmbed() {
    return `
      <div class="embed-editor layout-main" ref="$layoutMain">
        <CanvasView embed="true" />
        <Inspector />
        <FillPopup />
        <ColorPicker  />
        <BackgroundPropertyPopup />
        <BoxShadowPropertyPopup />   
        <TextShadowPropertyPopup />             
      </div>
    `;
  }

  templateForEditor() {
    return `
      <div class="layout-main" ref="$layoutMain">
        <div class="layout-header">
            <div class="page-tab-menu"><ToolMenu /></div>
        </div>
        <div class="layout-middle">
                  
          <div class="layout-right">
            <Inspector />
          </div>
          <div class="layout-body">
            <CanvasView />
            <DrawingView />            
          </div>                              
        </div>
        <FillPopup />
        <ColorPicker  />
        <BoxShadowPropertyPopup />
        <TextShadowPropertyPopup />
        <AnimationPropertyPopup />
        <TransitionPropertyPopup />
        <KeyframePopup />
        <ClipPathPopup />
        <SVGPropertyPopup />
        <SelectorPopup />
      </div>
    `;
  }

  components() {
    return {
      ...popup,
      FillPopup,
      ColorPicker,
      Inspector,
      ToolMenu,
      CanvasView
    };
  }

  [RESIZE("window") + DEBOUNCE(100)](e) {
    this.emit(RESIZE_WINDOW);
  }
}
