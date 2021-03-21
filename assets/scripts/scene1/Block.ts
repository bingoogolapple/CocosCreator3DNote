import { _decorator, Component, BoxCollider, v3, Collider } from "cc"

const { ccclass } = _decorator

@ccclass
export default class Block extends Component {

  onLoad() {

  }

  init(lastBlockX: number, blockY: number, blockZ: number) {
    this.node.position = v3(lastBlockX, blockY + Math.random() * 1, blockZ)
    this.node.setScale(v3(0.8 + Math.random() * 0.8, 0.3, 1))

    // let boxCollider = this.node.getComponent(BoxCollider)
    // boxCollider?.size.set(v3(1, 1, 1))
  }
}
