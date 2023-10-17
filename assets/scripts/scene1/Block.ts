import { _decorator, Component, BoxCollider, v3, Collider } from "cc";

const { ccclass } = _decorator;

@ccclass
export default class Block extends Component {
  // 过了新手保护期后随机设置跳板长度、间距、y 轴位置
  init(lastBlockX: number, blockInitY: number) {
    // 随机设置 x 轴缩放（长度）
    const nowScale = this.node.getScale();
    this.node.setScale(v3(0.8 + Math.random() * 0.8, nowScale.y, nowScale.z));

    // 随机设置 x 轴坐标（间距），y 轴位置（高度）
    const nowPos = this.node.position;
    this.node.setPosition(
      lastBlockX + 1.8 + Math.random() * 0.8,
      blockInitY + Math.random() * (Math.random() > 0.5 ? 0.5 : -0.5),
      nowPos.z
    );
  }
}
