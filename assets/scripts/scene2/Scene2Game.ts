import {
  _decorator,
  find,
  Component,
  Node,
  geometry,
  math,
  Camera,
  PhysicsSystem,
  input,
  Input,
  EventMouse,
  EventTouch,
  RigidBody,
  v3,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("Scene2Game")
export class Scene2Game extends Component {
  protected onLoad(): void {
    this.testRaycast();
    input.on(Input.EventType.TOUCH_END, this.handleTouchEnd, this);
    // input.on(Input.EventType.MOUSE_UP, this.handleMouseUp, this);
  }

  protected onDestroy(): void {
    input.off(Input.EventType.TOUCH_END, this.handleTouchEnd, this);
    // input.off(Input.EventType.MOUSE_UP, this.handleMouseUp, this);
  }

  private handleTouchEnd(event: EventTouch) {
    // 方式三：用相机构造一条从相机原点到屏幕某点发射出的射线
    const camera = find("Main Camera").getComponent(Camera);
    const ray = new geometry.Ray();
    // 将一个屏幕空间（左上角为原点）坐标转换为射线
    // 获得一条途径屏幕坐标（0，0）发射出的一条射线
    // camera.screenPointToRay(0, 0, ray)
    // 用相机构造一条从相机原点到屏幕某点发射出的射线
    camera.screenPointToRay(event.getLocationX(), event.getLocationY(), ray);
    // 检测所有的碰撞盒，并记录所有被检测到的结果，通过 PhysicsSystem.instance.raycastResults 访问结果
    if (PhysicsSystem.instance.raycast(ray)) {
      const raycastResults = PhysicsSystem.instance.raycastResults;
      // collider：击中的碰撞器
      // distance：击中点与射线起点的距离
      // hitPoint：击中点（世界坐标系中）
      // hitNormal：击中点所处面的法线（世界坐标系中）
      raycastResults.forEach((raycastResult) => {
        console.log(
          "raycastResult",
          raycastResult,
          raycastResult.collider.node.name
        );

        const rigidBody = raycastResult.collider.node.getComponent(RigidBody);
        // 设置线性速度
        rigidBody.setLinearVelocity(v3(0, 0, 1));
        // 设置旋转速度
        rigidBody.setAngularVelocity(v3(0, Math.PI * 2, 0));
        console.log("1111", math.TWO_PI);
        // 在世界空间中，相对于刚体的质心的某点上对刚体施加作用力
        rigidBody.applyForce(v3(-20, 0, 0));
        // 在世界空间中，相对于刚体的质心的某点上对刚体施加冲量
        rigidBody.applyImpulse(v3(-5, 0, 0));
        // 在世界空间中，对刚体施加扭矩
        rigidBody.applyTorque(v3(0, -10, 0));
      });
    } else {
      console.log("没有撞到任何物体");
    }
  }

  // 测试射线检测
  private testRaycast() {
    // 方式一：通过「起点 + 方向」，ray 的构造函数或静态接口 create
    // 构造一条从（0，0，0）出发，指向 Z 轴的射线
    // 通过静态方法 create，前三个参数是起点，后三个参数是方向
    const ray = geometry.Ray.create(0, 0, 0, 0, 0, -1);
    // 或者通过构造方法
    // const ray = new geometry.Ray(0, 0, 0, 0, 0, -1);

    // 方式二：通过「起点 + 射线上的另一点」，ray 的静态接口 fromPoints
    // 构造一条从原点出发，指向 Z 轴的射线
    // const ray = new geometry.Ray();
    // 用两个点创建一条射线。
    // geometry.Ray.fromPoints(ray, math.Vec3.ZERO, math.Vec3.UNIT_Z);

    /**
     * worldRay：世界空间下的射线
     * mask：用于过滤的 掩码，可以传入需要检测的分组，默认为 0xffffffff。(1 << 0) | (1 << 1)
     * maxDistance：最大检测距离，默认为 10000000，目前请勿传入 Infinity 或 Number.MAX_VALUE
     * queryTrigger：是否检测触发器
     */
    // 检测所有的碰撞盒，并记录与射线距离最短的检测结果，通过 PhysicsSystem.instance.raycastClosestResult 访问结果
    if (PhysicsSystem.instance.raycastClosest(ray)) {
      const raycastClosestResult = PhysicsSystem.instance.raycastClosestResult;
      /**
       * collider：击中的碰撞器组件实例。可以通过碰撞器组件的 node 属性来获取所在节点
       * distance：击中点与射线起点的距离
       * hitPoint：射线撞到物体的击中点（世界坐标系中）
       * hitNormal：击中点所处面的法线（世界坐标系中），光的反射时计算反射向量
       */
      console.log(
        "raycastClosestResult",
        raycastClosestResult,
        raycastClosestResult.collider.node.name
      );
    } else {
      console.log("没有撞到任何物体");
    }
  }
}
