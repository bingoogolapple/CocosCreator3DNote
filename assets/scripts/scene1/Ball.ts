import { _decorator, Component, RigidBody, v3, Collider, ICollisionEvent } from 'cc'
const { ccclass } = _decorator

@ccclass
export default class Ball extends Component {
  initVelocityY: number = 0

  onLoad() {
    // https://docs.cocos.com/creator/3.0/manual/zh/physics/physics-event.html
    let collider = this.getComponent(Collider)
    collider?.on("onCollisionEnter", this.onCollisionEnter, this)
  }

  private onCollisionEnter(event: ICollisionEvent) {
    let rigidBody = this.node.getComponent(RigidBody)
    if (!this.initVelocityY) {
      // 初次碰撞，记录 y 轴加速度
      let linearVelocity = v3(0, 0, 0)
      rigidBody?.getLinearVelocity(linearVelocity)
      this.initVelocityY = linearVelocity.y
      console.log("y 轴的初始加速度", this.initVelocityY)
    } else {
      // 非初次碰撞，恢复 y 会走加速度
      rigidBody?.setLinearVelocity(v3(0, this.initVelocityY, 0))
    }
  }

  /**
     * 加速
     */
  boost() {
    let rigidBody = this.node.getComponent(RigidBody)
    rigidBody?.setLinearVelocity(v3(0, -18, 0))
  }
}
