// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import StackOfChips from './StackOfChips'
cc.Class({
  extends: cc.Component,

  properties: {
    chips: {
      default: null,
      type: StackOfChips,
    },
    valueEditBox: {
      default: null,
      type: cc.EditBox,
    },
    nickNameEditBox: {
      default: null,
      type: cc.EditBox,
    },
    maxchipsEditBox: {
      default: null,
      type: cc.EditBox,
    },
    valueSlider: {
      default: null,
      type: cc.Slider,
    },
    valueSliderMax: 900000,
    valueSliderMin: 0,
  },

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {},

  start() {},

  valueChangeByEditBox() {
    const result = Number(this.valueEditBox.string);
    this.chips.value = result;
    this.valueSlider.progress =
      (result - this.valueSliderMin) /
        (this.valueSliderMax - this.valueSliderMin) >
      1
        ? 1
        : result / (this.valueSliderMax - this.valueSliderMin);
  },

  valueChangeBySlider() {
    const result = Math.round(
      this.valueSliderMin +
        this.valueSlider.progress * (this.valueSliderMax - this.valueSliderMin)
    );
    this.valueEditBox.string = result;
    this.unscheduleAllCallbacks();
    this.scheduleOnce(()=>{
        this.chips.value = this.valueEditBox.string
    },.3)
  },

  nickNameChange() {
      this.chips.nickname = this.nickNameEditBox.string;
  },

  maxCountChange() {
      this.chips.maxCount = Number(this.maxchipsEditBox.string);
  },

  tagPostionChnage(target,type) {
      cc.log(this.chips.tagPostion);
      cc.log(type);
      cc.log(Number(type));
      this.chips.tagPostion=Number(type);
  },

  switchIsEffect() {
      this.chips.isEffect = !this.chips.isEffect;
  },

  switchHasNickName() {
      this.chips.tagHasNickname = !this.chips.tagHasNickname;
  },

  switchHasValue() {
      this.chips.tagHasValue = !this.chips.tagHasValue;
  },
  // update (dt) {},
});
