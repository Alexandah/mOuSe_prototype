import DOMDopper from "DOMHopper";
import InputLanguage from "InputLanguage";

var domHopper = new DOMHopper();

const UP = "k";
const DOWN = "j";
const LEFT = "h";
const RIGHT = "l";
const LEFT_CLICK = " ";
const RIGHT_CLICK = "enter";
const INC = "Shift";
const DEC = "Control";

var controls = new InputLanguage();
controls.defWord([UP], domHopper.jumpUp);
controls.defWord([DOWN], domHopper.jumpDown);
controls.defWord([RIGHT], domHopper.jumpRight);
controls.defWord([LEFT], domHopper.jumpLeft);
controls.defWord([INC], domHopper.moveSelectionLvlUp);
controls.defWord([DEC], domHopper.moveSelectionLvlDown);
