import {
  _decorator,
  Component,
  Node,
  Label,
  Prefab,
  v3,
  instantiate,
  input,
  director,
  Camera,
  EventKeyboard,
  Input,
  KeyCode,
  view,
  screen,
} from "cc";
import Ball from "./Ball";
import Block from "./Block";
const { ccclass, property } = _decorator;

/**
 * 编辑器的基本操作与快捷方式：
 * a、层级管理器中双击节点：让节点来到视野中央，方便编辑节点
 * b、两个手指滑动 || 滑动鼠标滚轮：放大或缩小场景
 * c、alt + 鼠标左键（触摸板按下一个手指）：以当前视角的中心点来旋转场景，可以 360 度查看节点
 * d、两个手指按住拖动 || 按住鼠标右键拖动：「以摄像机为中心」来旋转场景
 * e、两个手指按住 || 按住鼠标右键，然后通过 asdw 键「以摄像机为中心」来移动场景
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
 * 6、此时小球没有回弹效果
 *   6.1、3.0.0 版本：在「项目 -> 项目设置 -> 物理 」中将弹性系数设置为 1，摩擦系数设置为 0，来让小球弹回原始下落位置
 *   6.2、3.8.1 版本：在「项目 -> 项目设置 -> 物理 」中已经没有单独设置默认弹性系数和摩擦系数的地方了，而是通过默认材质来设置
 *     6.2.1、但这个例子中不通过默认材质来修改，而是单独创建一个物理材质 pm_ball_and_block，将「物理摩擦、滚动物理摩擦、旋转物理摩擦」设置为 0，将「弹性系数」设置为 1
 *     6.2.2、将上一步创建的物理材质赋值给「小球 ball 的 cc.SphereCollider、跳板 ball_block 的 cc.BoxCollider」的 Material
 *     6.2.3、「有个大坑需要特别注意」在 3.8.1 版本中，添加球碰撞器组件 SphereCollider 时 Center 的默认值不是 0 0 0，会导致小球无法回弹，需要手动修改为 0 0 0
 */

/**
 * 1、3D 游戏内容 + 盖一层 UI 给用户操作，UI 与 3D 的内容是独立的
 * 2、两个摄像机来负责绘制，3D 摄像机（投影类型 Projection 是透视投影 PERSPECTIVE）和 UI 摄像机（投影类型 Projection 是正交投影 ORTHO）
 * 3、所有的 UI 是在世界的另一个地方来放 UI 物体，避免和 3D 场景叠加再一起。UI 也是 3D 世界里面的物体
 * 4、引擎规定，所有的 UI 节点都要在 Canvas 下
 * 5、UI 摄像机只会绘制 UI_3D、UI_2D，UI 节点的 Layer 必须设置为 UI_2D、UI_3D 才能被 UI 摄像机显示出来
 * 6、编辑的时候：Canvas 节点是一个蓝色的框，这个框的大小表示 UI 设计分辨率
 *   6.1、在「项目->项目设置->项目数据」中设置
 *   6.2、cocos creator 默认是 1280 x 720，高分辨率用 1920 x 1080，低分辨率用 960 x 640
 *   6.3、开发期间基于这个蓝色的框来摆放 UI，摆出来的范围就是设计分辨率范围
 * 7、运行的时候：Canvas 的真实大小就是屏幕大小，随着屏幕变化而变化
 *   7.1、Canvas 组件时有个特殊的组件 cc.Widget，设置 Canvas 节点上下左右距离屏幕边缘都是 0 来实现 Canvas 节点和屏幕一样大
 * 8、分辨率
 *   8.1、屏幕像素分辨率：屏幕到底多少个像素分辨率，1920 x 1080 的屏幕
 *   8.2、逻辑分辨率：对于 UI 设计者而言，摆位置时没有像素分辨率，只有一个基于逻辑分辨率。没办法同时满足两个维度，可以做一个修改，确保一个维度一样，一个维度不一样
 *      8.2.1、设计分辨率：1920 x 1080，屏幕的像素：960 x 640
 *      8.2.2、视频屏幕宽度（固定宽度）：保持宽度与设计分辨率一样，高度不一样。逻辑分辨率宽度就是 1920，比例就是 960 / 1920 = 0.5，逻辑高度就是 640 / 0.5 = 1280，此时 UI 适配就是把 1080 的内容排布到 1280 的范围内，1920 x 1280
 *      8.2.3、视频屏幕高度（固定高度）：保持高度与设计分辨率一样，宽度不一样。逻辑分辨率高度就是 1080，比例就是 640 / 1080 = 0.59259，逻辑宽度就是 960 / 0.59259 = 1620，此时 UI 适配就是把 1920 的内容排布到 1620 的范围内，1620 x 1080
 *   8.3、做 2D UI 的时候会做适配（3D 是没有适配的），就是在一个屏幕内，把 UI 都布局好，不同的分辨率，UI 节点都能布局好
 *   8.4、通过 view.getVisibleSize() 获取逻辑分辨率，通过 view.getVisibleSizeInPixel() 获取像素分辨率
 *   8.5、cc.UITransform 是 2D UI 特有的，描述 UI 的大小（是逻辑分辨率）和锚点（是比例）
 */
@ccclass
export class Scene1Game extends Component {
  private static readonly BLOCK_COUNT: number = 9;
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
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    // 监听当按下按键时触发的事件
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);

    // 设置小球初始位置
    this.ballNode.position = v3(0, 2, 0);

    // 初始化跳板
    this.initBlock();

    console.log(
      "visibleSize",
      view.getVisibleSize(), // 返回视图窗口可见区域尺寸。逻辑分辨率
      "visibleSizeInPixel",
      view.getVisibleSizeInPixel(), // 返回视图窗口可见区域像素尺寸。像素分辨率，GameCanvas 的宽高
      "windowSize",
      screen.windowSize, // 获取和设置当前窗口的物理像素尺寸
      "resolution",
      screen.resolution // 获取当前游戏的分辨率
    );
    // 监听单次屏幕大小变更
    screen.once(
      "window-resize",
      (...args) => {
        console.log("window-resize", args);
      },
      this
    );
  }

  onDestroy() {
    // 取消监听手指结束触摸事件
    input.off(Input.EventType.TOUCH_END, this.onTouchStart, this);
    // 取消监听当按下按键时触发的事件
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
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
      case KeyCode.SPACE:
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
      if (nextX < -10) {
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
