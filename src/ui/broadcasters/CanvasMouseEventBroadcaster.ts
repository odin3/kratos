import {UIComponent} from '../UIComponent';
import {Storyboard} from '../Storyboard';
import {Point} from '../types/Point';
import {UIMouseEvent} from '../../events';
import {$null, $async, $defined, Dictionary} from '../../helpers';
import {CanvasEventBroadcaster} from '../types/CanvasEventBroadcaster';

export class CanvasMouseEventBroadcaster extends CanvasEventBroadcaster {
  private elementFound: boolean = false;
  private eventHandlers: Dictionary = new Dictionary();

  public constructor(owner: Storyboard, events: string[] = [], autobind: boolean = false) {
    super(owner, events);
    this._initHandlers();
  }

  protected _initHandlers() {
    this.eventHandlers.defaultKey = 'mousemove';
    this.eventHandlers
      .add('click', function (element: UIComponent, event: MouseEvent) {
        let old: UIComponent = this.mapper.currentMouseElement;
        if (old === null || (old.id === element.id)) {
          this.mapper.currentMouseElement = element;
          let tEvent: UIMouseEvent = new UIMouseEvent(element, event);
          element.emit(event.type, tEvent);
        } else {
          old.broadcast('blur', new UIMouseEvent(element, event));

          this.mapper.currentMouseElement = element;
          let tEvent: UIMouseEvent = new UIMouseEvent(element, event);
          element.emit(event.type, tEvent);
        }

      })
      .add('mousemove', function (element: UIComponent, event: MouseEvent) {
        let old: UIComponent = this.mapper.currentMouseElement;
        let tEvent: UIMouseEvent = null;

        if ($null(old)) {
          this.mapper.currentMouseElement = element;
          tEvent = new UIMouseEvent(element, event);
          element.emit('mouseover', tEvent);
        } else {
          if (old.id !== element.id) {
            // Send to old element
            tEvent = new UIMouseEvent(old, event);
            old.emit('mouseout', tEvent);

            this.mapper.currentMouseElement = element;

            // New element
            tEvent = new UIMouseEvent(element, event);
            element.emit('mouseover', tEvent);
          }
        }
      })
      .alias('dblclick, mousedown, mouseup, mouseout', 'click');
  }

  protected targetEvent(element: UIComponent, event: MouseEvent) {
    let p: Point = new Point(event.layerX, event.layerY);
    if (element.inBoundsOf(p)) {
      return this.react(element, event);
    } else {
      element.controls.forEach((_element: UIComponent) => {
        this.targetEvent(_element, event);
      });
    }

  }

  protected react(element: UIComponent, event: MouseEvent) {
    this.elementFound = true;
    this.eventHandlers.get(event.type).call(this, element, event);
  }

  protected bindEvent(event: MouseEvent) {
    let owner: Storyboard = this.owner;
    let cElement: UIComponent = this.mapper.currentMouseElement;
    let pElement: UIComponent = this.mapper.previousMouseElement;
    this.elementFound = false;

    this.mapper.previousMouseElement = cElement;

    // Emit to form
    owner._emit(event.type, new UIMouseEvent(owner, event));

    // Broadcast to children
    owner.controls.forEach((element: UIComponent) => {
      this.targetEvent(element, event);
    });

    // If element not found, trigger to prev element
    if (!this.elementFound && !$null(this.mapper.previousMouseElement)) {
      if (!$null(pElement)) pElement.emit('mouseout', new UIMouseEvent(pElement, event));
      this.mapper.currentMouseElement = null;
      this.mapper.previousMouseElement = null;
    }

  }
}
