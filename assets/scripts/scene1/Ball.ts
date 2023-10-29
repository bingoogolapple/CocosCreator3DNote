import {
  _decorator,
  Component,
  RigidBody,
  v3,
  Collider,
  ICollisionEvent,
} from "cc";
const { ccclass } = _decorator;

/**
 * 1、给球绑定 Ball 组件
 * 2、碰撞开始时，如果是初次碰撞则记录 y 轴的线性速度，非初次碰撞则恢复 y 轴线性速度
 */

@ccclass
export default class Ball extends Component {
  initVelocityY: number = 0;

  onLoad() {
    // https://docs.cocos.com/creator/3.0/manual/zh/physics/physics-event.html
    let collider = this.getComponent(Collider);
    collider?.on("onCollisionEnter", this.onCollisionEnter, this);
  }

  private onCollisionEnter(event: ICollisionEvent) {
    let rigidBody = this.node.getComponent(RigidBody);
    if (!this.initVelocityY) {
      // 初次碰撞，记录 y 轴加速度
      let linearVelocity = v3(0, 0, 0);
      rigidBody?.getLinearVelocity(linearVelocity);
      this.initVelocityY = linearVelocity.y;
      // 此时已经是向上反弹时的加速度了，是个正数
      console.log("y 轴的初始加速度", this.initVelocityY);
    } else {
      // 非初次碰撞，恢复 y 轴加速度
      rigidBody?.setLinearVelocity(v3(0, this.initVelocityY, 0));
    }
  }

  /**
   * 向下加速，是个负数
   */
  boost() {
    let rigidBody = this.node.getComponent(RigidBody);
    rigidBody?.setLinearVelocity(v3(0, -18, 0));
  }
}
