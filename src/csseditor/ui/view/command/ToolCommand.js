import UIElement, { COMMAND } from "../../../../util/UIElement";
import { editor, EDIT_MODE_SELECTION } from "../../../../editor/editor";
import { Length } from "../../../../editor/unit/Length";
import { uuidShort } from "../../../../util/functions/math";
import AssetParser from "../../../../editor/parse/AssetParser";
import Dom from "../../../../util/Dom";
import { Project } from "../../../../editor/items/Project";


export default class ToolCommand extends UIElement {
    refreshSelection () {
        this.emit('refreshAll')
        this.emit('hideSubEditor');
        this.emit('refreshSelection');        
        this.emit('refreshSelectionTool')       
    }

    [COMMAND('save.json')] (filename) {
        var json = JSON.stringify(editor.projects)
        var datauri = 'data:application/json;base64,' + window.btoa(json);

        var a = document.createElement('a');
        a.href = datauri; 
        a.download = filename || 'easylogic.json'
        a.click();
    }

    [COMMAND('load.json')] (json) {
        json = json || [{"id":"id1c024ee","visible":true,"lock":false,"selected":false,"layers":[{"id":"id2226850","visible":true,"lock":false,"selected":false,"layers":[],"position":"absolute","x":"300px","y":"300px","width":"375px","height":"720px","background-color":"white","background-image":"background-image: linear-gradient(to right, red, red);background-position: 0% 0%;background-size: auto;background-repeat: repeat;background-blend-mode: normal","font-size":"13px","border":{},"outline":{},"borderRadius":{},"animations":[],"transitions":[],"keyframes":[],"selectors":[],"svg":[],"timeline":[],"itemType":"artboard","name":"New ArtBoard"}],"colors":[],"gradients":[],"svgfilters":[],"svgimages":[],"images":[],"itemType":"project","name":"New project","keyframes":[]}]

        var projects = json.map(p => {
            return new Project(p);
        })

        editor.load(projects);
        this.refreshSelection()
    }

    [COMMAND('copy')] () {
        editor.selection.copy();
    }

    [COMMAND('paste')] () {
        editor.selection.paste();
        this.emit('refreshAll');
    }

    [COMMAND('keyup.canvas.view')] (key) {
        var command = this.getAddCommand(key);

        this.trigger(...command);
    }

    getAddCommand (key) {
        switch(key) {
        case '1': return ['add.type', 'rect'];
        case '2': return ['add.type', 'circle'];
        case '3': return ['add.type', 'text'];
        case '4': return ['add.type', 'image'];
        case '5': return ['add.type', 'cube'];
        case '6': return ['add.path'];
        case '7': return ['add.polygon'];
        case '8': return ['add.star'];
        }
    }

    /* tools */ 
    
    [COMMAND('switch.theme')] () {
        if (editor.theme === 'dark') {
            editor.changeTheme('light')
        } else {
            editor.changeTheme('dark')
        }

        this.emit('changeTheme')
    }

    [COMMAND('show.exportView')] () {
        this.emit('showExportWindow');
    }

    [COMMAND('update.scale')] (scale) {
        editor.scale = scale;     
        this.emit('changeScale')
    }

    /* files */ 
    [COMMAND('drop.items')] (items = []) {
        this.trigger('update.resource', items);
    }

    [COMMAND('load.original.image')] (obj, callback) {

        var img = new Image();
        img.onload = () => {

            var info = {
                naturalWidth: Length.px(img.naturalWidth),
                naturalHeight: Length.px(img.naturalHeight), 
                width: Length.px(img.naturalWidth),
                height: Length.px(img.naturalHeight)
            }

            callback && callback(info);
        }
        img.src = obj.local; 
    }

    [COMMAND('add.assets.image')] (obj, rect = {}) {
        var project = editor.selection.currentProject;

        if (project) {

            // append image asset 
            project.createImage(obj);
            this.emit('addImageAsset');

            // convert data or blob to local url 
            this.trigger('load.original.image', obj, (info) => {
                this.trigger('add.image', {src: obj.local, ...info, ...rect });
                editor.changeMode(EDIT_MODE_SELECTION);
                this.emit('after.change.mode');                
            });

        }
    }

    [COMMAND('add.assets.svgfilter')] (callback) {

        var project = editor.selection.currentProject;

        if (project) {
            var id = uuidShort()
            var index = project.createSVGFilter({ id, filters: []})
    
            callback && callback (index, id);
        }

    }

    [COMMAND('update.uri-list')] (item) {

        var datauri = item.data; 
        if (datauri.indexOf('data:') > -1) {
            var info = AssetParser.parse(datauri, true);

            // datauri 그대로 정의 될 때 
            switch(info.mimeType) {
            case 'image/png':  
            case 'image/gif': 
            case 'image/jpg': 
            case 'image/jpeg': 
                this.trigger('add.assets.image', {
                    type: info.mimeType,
                    name: '',
                    original: datauri, 
                    local: info.local
                });            
                break; 
            }
        } else {

            // url 로 정의 될 때 
            var ext = item.data.split('.').pop();
            var name = item.data.split('/').pop();

            switch(ext) {
            case 'png':
            case 'jpg':
            case 'gif':
            case 'svg':

                this.trigger('add.assets.image', {
                    type: 'image/' + ext,
                    name,
                    original: item.data, 
                    local: item.data
                })
                break; 
            }
        }

    }

    [COMMAND('update.image')] (item, rect) {
        var reader = new FileReader();
        reader.onload = (e) => {
            var datauri = e.target.result;
            var local = URL.createObjectURL(item);

            this.trigger('add.assets.image', {
                type: item.type,
                name: item.name, 
                original: datauri, 
                local
            }, rect)
        }

        reader.readAsDataURL(item);
    }

    [COMMAND('update.resource')] (items) {
        items.forEach(item => {
            switch(item.type) {
            case 'image/svg+xml': 
            case 'image/png':  
            case 'image/gif': 
            case 'image/jpg': 
            case 'image/jpeg': 
                this.trigger('update.image', item); 
                break; 
            case 'text/plain':
            case 'text/html':
                if (items.length) {
                    this.trigger('add.text', {
                         content: item.data
                    });
                }
                // this.trigger('update.string', item);
                break;
            case 'text/uri-list':
                this.trigger('update.uri-list', item);
                break;
            }
        })
    }
}