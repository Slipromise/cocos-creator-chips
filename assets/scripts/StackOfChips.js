const TagPositonEnum = cc.Enum({
  NONE: 0,
  TOP: 1,
  BOTTOM: 2,
});

const KindOfChip = cc.Class({
  name: "KindOfChip",
  properties: {
    value: 10,
    defaultCount:5,
    chip: {
      default: null,
      type: cc.Prefab,
    },
    pool: {
      default: null,
      type: cc.NodePool,
      visible: false,
    },
  },
});

cc.Class({
  extends: cc.Component,
  ctor: function () {
    this._tagPostion = TagPositonEnum.TOP;
    this._nickname = "Nickname";
    this._tagHasValue = true;
    this._tagHasNickname = true;
    this._value = 0;
    this._tmpValue = 0;
    
  },
  properties: {
    // model
    isEffect:true,
    value: {
      type: cc.Integer,
      set(value) {
        this._tmpValue = value;
        if (CC_EDITOR) {
          this._value = value;
          this.setTagLabel();
        }
      },
      get() {
        return this._value;
      },
    },
    nickname: {
      type: cc.String,
      set(nickname) {
        this._nickname = nickname;
        if (CC_EDITOR) {
          this.setTagLabel();
        }
      },
      get() {
        return this._nickname;
      },
    },
    maxCount: {
      default: 6,
    },
    tagPostion: {
      type: TagPositonEnum,
      set(postion) {
        this._tagPostion = postion;
        if (CC_EDITOR) {
          this.switchTagPostion();
        }
      },
      get() {
        return this._tagPostion;
      },
    },
    tagHasNickname: {
      type: cc.Boolean,
      set(tagHasNickname) {
        this._tagHasNickname = tagHasNickname;
        if (CC_EDITOR) {
          this.setTagLabel();
        }
      },
      get() {
        return this._tagHasNickname && this.tagPostion != TagPositonEnum.NONE;
      },
    },
    tagHasValue: {
      type: cc.Boolean,
      set(tagHasValue) {
        this._tagHasValue = tagHasValue;
        if (CC_EDITOR) {
          this.setTagLabel();
        }
      },
      get() {
        return this._tagHasValue && this.tagPostion != TagPositonEnum.NONE;
      },
    },
    kindList: {
      default: [],
      type: KindOfChip,
    },
    // ref

    topTagNode: {
      default: null,
      type: cc.Node,
    },
    topTagLabel: {
      default: null,
      type: cc.Label,
    },
    bottomTagNode: {
      default: null,
      type: cc.Node,
    },
    bottomTagLabel: {
      default: null,
      type: cc.Label,
    },
    chipsNode: {
      default: null,
      type: cc.Node,
    },
    defaultSymbol:{
      default:null,
      type:cc.Node,
    },
    chipDropSound:{
      default:null,
      type:cc.AudioClip
    },
    chipCollectSound:{
      default:null,
      type:cc.AudioClip
    },
    dropChipAnimation:{
      default:null,
      type:cc.Animation
    }
  },

  onLoad() {
    this.kindList.forEach((kind) => {
      const { value, chip, defaultCount } = kind;
      kind.pool = new cc.NodePool(`ChipPool_${value}`);
      for (let i = 0; i < defaultCount; i++) {
        const node = cc.instantiate(chip);
        node.name = `chip-${value}`;
        kind.pool.put(node);
      }
    });
    this.defaultSymbol.active = false;
  },

  update (dt) {
    this.switchTagPostion();
    this.setTagLabel();
    if(this._tmpValue!= this.value){
      const isIncrease = this._tmpValue > this.value;
      this.setChips();
      this.isEffect && this.playSundAndAnimation(isIncrease);
    }
  },

  playSundAndAnimation(isIncrease){

    isIncrease && this.chipDropSound && cc.audioEngine.playEffect(this.chipDropSound);
    isIncrease && this.dropChipAnimation && this.dropChipAnimation.play();

    !isIncrease && this.chipCollectSound && cc.audioEngine.playEffect(this.chipCollectSound);
  },

  switchTagPostion() {
    const hasTag = this.tagHasNickname || this.tagHasValue;
    this.topTagNode.active = hasTag && this.value >0 && this.tagPostion == TagPositonEnum.TOP;
    this.bottomTagNode.active = hasTag && this.value >0 && this.tagPostion == TagPositonEnum.BOTTOM;
    
  },

  setTagLabel() {
    const txt =
      this.tagHasNickname && this.tagHasValue
        ? `${this.nickname}\n${this.value}`
        : this.tagHasNickname && !this.tagHasValue
        ? `${this.nickname}`
        : !this.tagHasNickname && this.tagHasValue
        ? `${this.value}`
        : "";
    const fontSize = this.tagHasNickname && this.tagHasValue ? 15:24;
    this.topTagLabel.string = this.bottomTagLabel.string = txt;
    this.topTagLabel.fontSize = this.bottomTagLabel.fontSize = fontSize;
  },

  setChips() {
    // children
    let resultList = [];
    let tmpValue = this._tmpValue;
    let isOverfull;
    
    for (let i = 0; i < this.maxCount; i++) {
      for (let j = this.kindList.length - 1; j >= 0; j--) {
        const { value } = this.kindList[j];
        if (tmpValue >= value) {
          tmpValue = tmpValue - value;
          resultList.push(value);
          break;
        }
      }
    }
    isOverfull = tmpValue > 0 ;

    this.recycleChips();
    
    resultList = isOverfull ? [] : this.getChipNodes(resultList);

    this.defaultSymbol.active = isOverfull;
    
    isOverfull && (this.chipsNode.height = 0);

    for (let i = 0; i < resultList.length; i++) {
      const node = resultList[i];
      this.chipsNode.addChild(node, i);
    }
    
    this._value = this._tmpValue;
  },
  getChipNodes(values=[]){
    const result = values.map((value) => {
      const { pool, chip } = this.kindList.find((k) => k.value == value);
      let node;
      if (pool.size() > 0) return pool.get();
      else {
        node = cc.instantiate(chip);
        node.name = `chip-${value}`;
        return node;
      }
    });
    return result;
  },
  recycleChips(){
    for (let i = this.chipsNode.childrenCount - 1; i >= 0; i--) {
      const node = this.chipsNode.children[i];
      const { pool } = this.kindList.find(
        (k) => k.value == node.name.replace(/\D/g, "")
      );
      pool.put(node);
    }
  }
});
