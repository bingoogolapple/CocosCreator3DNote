import {
  _decorator,
  Component,
  Node,
  Label,
  Prefab,
  v3,
  instantiate,
  systemEvent,
  sp,
  director,
  SystemEventType,
  Camera,
  EventKeyboard,
  macro,
} from "cc";
import Ball from "./Ball";
import Block from "./Block";
const { ccclass, property } = _decorator;

/**
 * 1、新建一个空节点 Game 用来存放 3D 场景
 * 2、在 Game 节点下新建一个 3D 对象立方体 ball_block，使用缩放工具调整的扁一点，用来当做来当做跳板
 * 3、在 Game 节点下新建一个 3D 对象球体 ball，小球太大了，调整小球缩放为 0.5
 * 4、给跳板赋予物理属性
 *   4.1、添加刚体组件 RigidBody，刚体类型 type 设置为静态刚体 STATIC（可用于描述静止的建筑物，若物体需要持续运动，应设置为 KINEMATIC 类型）
 *   4.2、添加盒碰撞器组件 BoxCollider
 * 5、给小球赋予物理属性
 *   5.1、添加刚体组件 RigidBody，刚体类型 type 设置为动力学刚体 DYNAMIC（能够受到力的作用，请通过物理规律来运动物体，并且请保证质量大于 0），刚体的质量 mass 设置为 1
 *   5.2、添加球碰撞器组件 SphereCollider
 * 6、此时小球没有回弹效果，在「项目 -> 项目设置 -> 物理 」中将弹性系数设置为 1，摩擦系数设置为 0，来让小球弹回原始下落位置
 */
/**
 * 编辑器的基本操作与快捷方式：
 * a、层级管理器中双击节点：让节点来到视野中央，方便编辑节点
 * b、两个手指滑动 || 滑动鼠标滚轮：放大或缩小场景
 * c、alt + 鼠标左键（触摸板按下一个手指）：以当前视角的中心点来旋转场景，可以 360 度查看节点
 * d、两个手指按住拖动 || 按住鼠标右键拖动：以摄像机为中心来旋转场景
 * e、两个手指按住 || 按住鼠标右键，然后通过 asdw 键来移动场景
 * e、鼠标双击坐标轴 || 触摸板单击坐标轴：可以从各个角度查看场景
 *      红色 x：从右往左看
 *      绿色 y：从上往下看
 *      蓝色 z：从前往后看
 *      黄色：表示选中状态
 * f、摆放物体：心中要先搞一个原点，想清楚了要怎么放这个 3D 场景
 *      平移：拖其中一个坐标轴可以保证其他方向不会被改动；如果是任意方向平移则可以拖中心点的小方块
 *      旋转：红色圈围绕 x 轴旋转，绿色圈围绕 y 轴旋转，蓝色圈围绕 z 轴旋转
 *      缩放：红色方块缩放 x，绿色方框缩放 y ，蓝色方块缩放 z
 *      矩形变换工具：针对 2D 的，3D 用不上
 * g、Local 相对于父亲的坐标，Global 相对于世界的坐标，本地的坐标不一定是世界的坐标
 *
 * 摆放摄像机：
 * a、可以通过平移、旋转来调整角度
 * b、也可以在编辑器中调好一个角度，然后再层级管理器中选中 Camera 并下 ctrl + shift + f，摄像机就会自动对到编辑器的可视视角
 * c、设计好如何在世界里摆放场景，摆好以后如何摆放摄像机；一般从世界坐标的原点（0，0，0）开始摆放
 */
@ccclass
export class Scene1Game extends Component {
  private static readonly BLOCK_COUNT: number = 6;
  @property(Label)
  private scoreLabel!: Label;
  @property(Node)
  private ballNode!: Node;
  // 跳板预制体
  @property(Prefab)
  private blockPrefab!: Prefab;

  @property(Camera)
  private camera1!: Camera;
  @property(Camera)
  private camera2!: Camera;

  // 所有跳板
  private blockNodeArr: Node[] = [];
  // 最后一块跳板
  private lastBlockNode!: Node;
  // 跳板初始 y 轴位置
  private blockInitY!: number;
  // 分数
  private score: number = 0;

  // 游戏状态
  private gameStarted: boolean = false;

  onLoad() {
    // 监听手指结束触摸事件
    systemEvent.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    // 监听当按下按键时触发的事件
    systemEvent.on(SystemEventType.KEY_DOWN, this.onKeyDown, this);

    // 设置小球初始位置
    this.ballNode.position = v3(0, 2, 0);

    // 初始化跳板
    this.initBlock();
  }

  onDestroy() {
    // 取消监听手指结束触摸事件
    systemEvent.off(Node.EventType.TOUCH_END, this.onTouchStart, this);
    // 取消监听当按下按键时触发的事件
    systemEvent.off(SystemEventType.KEY_DOWN, this.onKeyDown, this);
  }

  /**
   * 监听到手指结束触摸事件时，判断小球是否已经初始化，未初始化时什么也不做，已初始化时设置小球加速下落
   */
  private onTouchStart() {
    let ball = this.ballNode.getComponent(Ball);
    if (!ball?.initVelocityY) {
      // 没有初始化 initVelocityY 时不继续执行
      return;
    }

    // 已初始化 initVelocityY 时设置小球加速下落
    ball.boost();
    this.gameStarted = true;
  }

  onKeyDown(event: EventKeyboard) {
    switch (event.keyCode) {
      case macro.KEY.space:
        // 监听到按下空格键时切换相机
        this.switchCamera();
        break;
    }
  }

  // 切换相机
  private switchCamera() {
    // 可以在场景中摆放多个相机，动态设置相机 active 来切换展示视角
    if (this.camera1.node.active) {
      this.camera1.node.active = false;
      this.camera2.node.active = true;
    } else {
      this.camera1.node.active = true;
      this.camera2.node.active = false;
    }
  }

  // 初始化跳板
  private initBlock() {
    // 最后一个方块的 x
    let lastBlockX = this.ballNode.position.x;
    this.blockInitY = this.ballNode.position.y - 4;
    let blockZ = this.ballNode.position.z;
    for (let i = 0; i < Scene1Game.BLOCK_COUNT; i++) {
      let blockNode = instantiate(this.blockPrefab);
      // 初始化位置。刚初始化时在新手保护期，跳板间距、长度、高度一样
      blockNode.setPosition(lastBlockX, this.blockInitY, blockZ);
      lastBlockX += 2;

      this.node.addChild(blockNode);
      // 保存跳板到数组中，以便后续移动跳板
      this.blockNodeArr.push(blockNode);
    }
    this.lastBlockNode = this.blockNodeArr[this.blockNodeArr.length - 1];
  }

  update(dt: number) {
    if (!this.gameStarted) {
      return;
    }

    // 每秒向左移动 2.5 个单位
    let speed = -2.5 * dt;
    for (let blockNode of this.blockNodeArr) {
      let nowPos = blockNode.getPosition();
      let nextX = (nowPos.x += speed);
      if (nextX < -3) {
        // 跳板超出左侧指定位置时将其设置为最后一块跳板，从而实现循环展示
        blockNode
          .getComponent(Block)
          ?.init(this.lastBlockNode.position.x, this.blockInitY);
        // 分数加一分
        this.incrementScore(1);

        this.lastBlockNode = blockNode;
      } else {
        // 跳板未超出左侧指定位置时更新跳板位置
        blockNode.setPosition(nextX, nowPos.y, nowPos.z);
      }
    }

    if (this.ballNode.position.y < -3) {
      // 小球下落到指定位置时游戏结束
      console.log("游戏结束");
      this.gameStarted = false;
      // 通过重新加载场景来重置游戏
      director.loadScene("scene1");
    }
  }

  // 增加得分
  incrementScore(increment: number) {
    this.score += increment;
    this.scoreLabel.string = this.score.toString();
  }
}
