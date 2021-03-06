import { Length } from "../../../editor/unit/Length";
import UIElement, { EVENT } from "../../../util/UIElement";
import Border from "../../../editor/css-property/Border";
import RangeEditor from "./RangeEditor";
import SelectEditor from "./SelectEditor";
import ColorViewEditor from "./ColorViewEditor";
import InputRangeEditor from "./InputRangeEditor";
import ColorSingleEditor from "./ColorSingleEditor";


const borderStyleList = [
  "none",
  "hidden",
  "dotted",
  "dashed",
  "solid",
  "double",
  "groove",
  "ridge",
  "inset",
  "outset"
].join(',');



export default class BorderValueEditor extends UIElement {
 
  components() {
    return {
      InputRangeEditor,
      RangeEditor,
      SelectEditor,
      ColorViewEditor,
      ColorSingleEditor
    }
  }

  initState() {

    return {
      value: Border.parseValue(this.props.value)
    }
  }

  updateData(obj) {
    this.setState(obj, false);
    this.parent.trigger(this.props.onchange, this.props.key, this.getValue(), this.props.params);  
  }

  getValue() {
    return Border.joinValue(this.state.value)
  }

  setValue(value) {
    this.state.value = Border.parseValue(value);
    this.refresh();
  }

  refresh () {

    this.children.$width.setValue(this.state.value.width || Length.px(0))
    this.children.$style.setValue(this.state.value.style || 'none')
    this.children.$color.setValue(this.state.value.color || 'rgba(0, 0, 0, 1)')
  }
  

  template() {
    var {width, style, color} = this.state.value; 
    return /*html*/`
      <div class="border-value-editor">
        <label>${this.props.label}</label>
        <div class='editor-area'>
          <InputRangeEditor ref='$width' min="0" max="100" step="1" key='width' value="${width}" onchange='changeKeyValue' />
        </div>
        <div class='editor-area'>
          <SelectEditor ref='$style' key='style' options='${borderStyleList}' value="${style}" onchange="changeKeyValue" />
        </div>
        <div class='editor-area'>
          <ColorSingleEditor ref='$color' key='color' value="${color|| 'rgba(0, 0, 0, 1)'}"  onchange="changeKeyValue" />
        </div>

      </div>
    `;
  }


  [EVENT('changeKeyValue')] (key, v) {
    var value = this.state.value;
    value[key] = v; 

    this.updateData({ value })
  }

}
