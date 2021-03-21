
import { _decorator, Component, Node, Label, Prefab, v3, instantiate, systemEvent, sp, director, SystemEventType, Camera, EventKeyboard, macro } from 'cc'
import Ball from './Ball'
import Block from './Block';
const { ccclass, property } = _decorator

/**
 * 编辑起的基本操作与快捷方式：
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
 * c、设计好如果在世界里摆放场景，摆好以后如何摆放摄像机；一般从世界坐标的原点（0，0，0）开始摆放
 */
/**
 * 项目 -> 项目设置 -> 物理
 */
@ccclass
export class Scene1Game extends Component {
    private static readonly BLOCK_COUNT: number = 10
    @property(Label)
    private scoreLabel: Label = null!
    @property(Node)
    private ballNode: Node = null!
    @property(Prefab)
    private blockPrefab: Prefab = null!

    @property(Camera)
    private camera1: Camera = null!
    @property(Camera)
    private camera2: Camera = null!

    private blockNodeArr: Node[] = []
    private lastBlockNode: Node = null!
    private score: number = 0

    private gameStarted: boolean = false

    onLoad() {
        systemEvent.on(Node.EventType.TOUCH_START, this.onTouchStart, this)
        systemEvent.on(SystemEventType.KEY_DOWN, this.onKeyDown, this)

        this.ballNode.position = v3(0, 2, 0)
        this.initBlock()
    }

    onDestroy() {
        systemEvent.off(Node.EventType.TOUCH_END, this.onTouchStart, this)
        systemEvent.off(SystemEventType.KEY_DOWN, this.onKeyDown, this)
    }

    private onTouchStart() {
        let ball = this.ballNode.getComponent(Ball)
        if (!ball?.initVelocityY) {
            return
        }
        ball.boost()
        this.gameStarted = true
    }

    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case macro.KEY.space:
                this.switchCamera()
                break
        }
    }

    private switchCamera() {
        if (this.camera1.node.active) {
            this.camera1.node.active = false
            this.camera2.node.active = true
        } else {
            this.camera1.node.active = true
            this.camera2.node.active = false
        }
    }

    private initBlock() {
        // 最后一个方块的 x
        let lastBlockX = this.ballNode.position.x
        let blockY = this.ballNode.position.y - 4
        let blockZ = this.ballNode.position.z
        for (let i = 0; i < Scene1Game.BLOCK_COUNT; i++) {
            let blockNode = instantiate(this.blockPrefab)
            blockNode.getComponent(Block)?.init(lastBlockX, blockY, blockZ)
            this.node.addChild(blockNode)
            this.blockNodeArr.push(blockNode)
            lastBlockX += this.getBlockXOffset()
        }
        this.lastBlockNode = this.blockNodeArr[this.blockNodeArr.length - 1]
    }

    update(dt: number) {
        if (!this.gameStarted) {
            return
        }

        let speed = -2.5 * dt
        for (let blockNode of this.blockNodeArr) {
            let nowPos = blockNode.getPosition()
            let nextX = nowPos.x += speed
            if (nextX < -3) {
                blockNode.setPosition(v3(this.lastBlockNode.position.x + this.getBlockXOffset(), nowPos.y, nowPos.z))
                this.lastBlockNode = blockNode
                this.incrementScore(1)
            } else {
                blockNode.setPosition(v3(nextX, nowPos.y, nowPos.z))
            }
        }

        if (this.ballNode.position.y < -3) {
            console.log("游戏结束")
            this.gameStarted = false
            director.loadScene("scene1")
        }
    }

    /**
     * 获取每个方块的横向间距
     */
    private getBlockXOffset(): number {
        return 1.8 + Math.random() * 0.8
    }

    incrementScore(increment: number) {
        this.score += increment
        this.scoreLabel.string = this.score.toString()
    }
}
