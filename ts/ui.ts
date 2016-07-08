import {core} from './core';

export module ui {

    export class Rectangle extends core.UIControl {
        public _render() {
            this.context.fillRect(this.position.x, this.position.y, this.height, this.width);
        }
    }

    export class Label extends core.UIControl {
        private $text:string = 'New Label';
        private $align:string = core.TextAlign.left;
        get text():string {
            return this.$text;
        }
        set text(newStr:string) {
            this.$emit('propertyChange',
                new core.PropertyChangedEvent(
                    this,
                    'text',
                    this.$text,
                    newStr
            ));
            this.$text = newStr;
            this.redrawContext();
        }

        get textAlign():string {
            return this.$align;
        }
        set textAlign(newVal:string) {
            this.$emit('propertyChange',
                new core.PropertyChangedEvent(
                    this,
                    'textAlign',
                    this.$align,
                    newVal
            ));
            this.$align = newVal;
            this.redrawContext();
        }

        public _render() {
            this.context.fillText(this.text, this.height, this.width);
        }
    }    
}