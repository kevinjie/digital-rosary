<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import * as THREE from 'three'
import earth from '../../assets/earth.jpg'
import pearl from '../../assets/pearl.jpg'
import basketball from '../../assets/basketball.jpg'
import hehua from '../../assets/hehua.jpg'
import shanshui from '../../assets/shanshui.jpg'
import yinhe from '../../assets/yinhe.jpeg'

const width = 375
const height = 667

const showPopup = ref(false)
const activeNames = ref(['1'])
const background = [
  {
    name: '荷花',
    value: hehua
  },
  {
    name: '山水',
    value: shanshui
  },
  {
    name: '银河',
    value: yinhe
  }
]
const beads = [
  {
    name: '地球',
    value: earth
  },
  {
    name: '珍珠',
    value: pearl
  },
  {
    name: '篮球',
    value: basketball
  }
]

const bindwidth = computed(() => `${width}px`)
const bindheight = computed(() => `${height}px`)

//创建场景
const scene = new THREE.Scene();

//创建相机
const camera = new THREE.PerspectiveCamera(60, width / height, .1, 1000);
// 设置相机的位置
camera.position.set(260, 0, 130)
//将相机快门的位置设置为场景的位置
camera.lookAt(scene.position);

//创建渲染器
const renderer = new THREE.WebGLRenderer({
  antialias:true,
  alpha:true
});
renderer.setSize(width, height);
renderer.setClearAlpha(0);
renderer.setPixelRatio(window.devicePixelRatio)
renderer.shadowMap.enabled = true;

// 设置光源
const ambient = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambient);
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(200, 300, 400);
scene.add(light);

// 设置辅助坐标轴
// const axesHelper = new THREE.AxesHelper(150);
// scene.add(axesHelper);

// 设置场景背景
const setSceneImage = (url) => {
	scene.background = new THREE.TextureLoader().load(url, function() {
    renderer.render(scene, camera)
  });
}

// 获取点位
const getPoint = (r, ox, oy, count) => {
  const radians = (Math.PI / 180) * Math.round(360 / count) //弧度
  const points = []

  for(let i = 0; i < count; i++) {
    points.push({
      x: ox + r * Math.sin(radians * i),
      y: oy + r * Math.cos(radians * i)
    })
  }

  return points
}

// 添加圆环
const setArcColor = (arc, color) => {
  arc.material.color = new THREE.Color(color)
  renderer.render(scene, camera)
}
const createArc = () => {
  const geometry = new THREE.TorusGeometry(80, 1, 25, 80)
  const material = new THREE.MeshBasicMaterial({
    color: '',
    wireframe: true
  })
  const circle = new THREE.Mesh(geometry, material)

  circle.position.x = 0
  circle.position.y = 0
  circle.position.z = 0

  return circle
}
const addArc = () => {
  const arc = createArc()
  setArcColor(arc, 0xedf621)
  scene.add(arc)
}

// 添加球体
const sphereGroup = new THREE.Group()
const setSphereTexture = (sphere, url) => {
  //材质贴图
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(url, function() {
    renderer.render(scene, camera)
  });
  sphere.material.map = texture
}
const createSphere = (position) => {
  const {x, y, z} = position
  //着色器
  const sphereGeometry = new THREE.SphereGeometry(10, 15, 15);
  const sphereMaterial = new THREE.MeshBasicMaterial({
      color: '',	//贴图颜色
      wireframe: false,	//是否开启线性渲染
      map: '',  //设置纹理贴图
      transparent:true,	//为true透明度才有用
      opacity: 1   //透明度
  });

  //生成球面体
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  //打开阴影效果
  sphere.castShadow = true;

  //设置球面体的位置
  sphere.position.x = x;
  sphere.position.y = y;
  sphere.position.z = z;

  return sphere
}
const addSphere = (count) => {
  const points = getPoint(80, 0, 0, count)
  points.forEach(async ({ x, y }) => {
    const sphere = createSphere({ x, y, z: 0 })
    setSphereTexture(sphere, earth)
    sphereGroup.add(sphere);
  })

  const pivot = new THREE.Vector3(0, 0, 1)
  sphereGroup.position.copy(pivot)
  scene.add(sphereGroup)
  scene.updateMatrixWorld(true)
}

// 设置旋转
const setRotate = (angle) => {
  sphereGroup.rotation.z -= angle

  sphereGroup.traverse((obj) => {
    obj.children.forEach(mesh => {
      mesh.rotation.z += angle
    })
  })
  renderer.render(scene, camera)
}

// 触发旋转
const initRotate = () => {
  setRotate(0.01)
}

let leftButtonBool = false;//记录鼠标左键状态
document.addEventListener('mousedown', () => {
  leftButtonBool = true;
})
document.addEventListener('mouseup', () => {
  leftButtonBool = false;
})

document.addEventListener('mousemove', (event) => {
  if (leftButtonBool) {
    setRotate((event.movementY || 0.6) / 60)
  }
});

document.addEventListener('click', initRotate);

const initWebgl = () => {
  addSphere(18)
  addArc()
  setSceneImage(hehua)
}

// 执行渲染
renderer.render(scene, camera)

const updateBackground = (url) => {
  setSceneImage(url)
  showPopup.value = false
}

const updateBeads = (url) => {
  sphereGroup.traverse((obj) => {
    obj.children.forEach(mesh => {
      setSphereTexture(mesh, url)
    })
  })

  showPopup.value = false
}

onMounted(() => {
  initWebgl()
  nextTick(() => {
    document.getElementById('webgl').appendChild(renderer.domElement)
  })

  setTimeout(() => {
    const click = new Event('click')
    document.dispatchEvent(click)
    document.removeEventListener('click', initRotate)
  }, 1000)
})
</script>

<template>
  <div class="container w-full h-full">
    <div id="webgl" class="absolute top-0 left-0" />
    <div class="setting absolute top-10px right-10px" @click="showPopup = true">
      <van-icon name="setting-o" color="#ee0a24" />
    </div>
    <van-popup
      v-model:show="showPopup"
      position="right"
      :style="{ width: '82%', height: '100%' }"
    >
    <van-collapse v-model="activeNames">
      <van-collapse-item title="背景" name="background">
        <div class="images flex justify-start flex-wrap">
          <van-image
            class="preview-image mx-5px mt-5px"
            v-for="item in background"
            :key="item.name"
            width="80"
            height="80"
            :src="item.value"
            @click="() => updateBackground(item.value)"
          />
        </div>
      </van-collapse-item>
      <van-collapse-item title="念珠" name="beads">
        <div class="images flex justify-start flex-wrap">
          <van-image
            class="preview-image mx-5px mt-5px"
            v-for="item in beads"
            :key="item.name"
            width="80"
            height="80"
            :src="item.value"
            @click="() => updateBeads(item.value)"
          />
        </div>
      </van-collapse-item>
      <van-collapse-item title="串绳" name="line">

      </van-collapse-item>
    </van-collapse>
    </van-popup>
  </div>
</template>

<style lang="less" scoped>
#webgl {
  width: v-bind(bindwidth);
  height: v-bind(bindheight);
}
:deep(.van-cell__title) {
  text-align: left;
}
</style>