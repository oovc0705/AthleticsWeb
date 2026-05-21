#!/usr/bin/env node

/**
 * i18n修复验证脚本
 * 用于验证i18n配置是否正确设置
 */

import fs from 'fs'
import path from 'path'

const checks = {
  vueI18nVersion: false,
  i18nIndexFile: false,
  setupI18nFile: false,
  mainJsUpdated: false,
  viteConfigUpdated: false,
  languagePacksExist: false,
  envFiles: false
}

function checkVueI18nVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
    const version = packageJson.dependencies['vue-i18n']
    checks.vueI18nVersion = version && version !== '^12.0.0-alpha.3'
    console.log(`✓ vue-i18n版本: ${version}${checks.vueI18nVersion ? ' [OK]' : ' [需要升级]'}`)
    return checks.vueI18nVersion
  } catch (err) {
    console.error('✗ 无法读取package.json:', err.message)
    return false
  }
}

function checkI18nIndexFile() {
  try {
    const content = fs.readFileSync('src/i18n/index.js', 'utf-8')
    checks.i18nIndexFile =
      content.includes('missingWarn: false') &&
      content.includes('fallbackWarn: false') &&
      content.includes("localStorage.getItem('language')")
    console.log(`✓ i18n/index.js配置: ${checks.i18nIndexFile ? '[OK]' : '[需要更新]'}`)
    return checks.i18nIndexFile
  } catch (err) {
    console.error('✗ 无法读取i18n/index.js:', err.message)
    return false
  }
}

function checkSetupI18nFile() {
  try {
    const exists = fs.existsSync('src/i18n/setupI18n.js')
    checks.setupI18nFile = exists
    console.log(`✓ setupI18n.js文件: ${exists ? '[OK]' : '[缺失]'}`)
    return exists
  } catch (err) {
    console.error('✗ 检查setupI18n.js失败:', err.message)
    return false
  }
}

function checkMainJsUpdated() {
  try {
    const content = fs.readFileSync('src/main.js', 'utf-8')
    checks.mainJsUpdated =
      content.includes('initializeI18n') &&
      content.includes('setupI18n')
    console.log(`✓ main.js i18n初始化: ${checks.mainJsUpdated ? '[OK]' : '[需要更新]'}`)
    return checks.mainJsUpdated
  } catch (err) {
    console.error('✗ 无法读取main.js:', err.message)
    return false
  }
}

function checkViteConfigUpdated() {
  try {
    const content = fs.readFileSync('vite.config.js', 'utf-8')
    checks.viteConfigUpdated =
      content.includes('manualChunks') &&
      content.includes('i18n-messages')
    console.log(`✓ vite.config.js优化: ${checks.viteConfigUpdated ? '[OK]' : '[需要更新]'}`)
    return checks.viteConfigUpdated
  } catch (err) {
    console.error('✗ 无法读取vite.config.js:', err.message)
    return false
  }
}

function checkLanguagePacksExist() {
  try {
    const zhExists = fs.existsSync('src/i18n/locales/zh-CN.js')
    const enExists = fs.existsSync('src/i18n/locales/en-US.js')
    checks.languagePacksExist = zhExists && enExists

    if (zhExists) {
      const content = fs.readFileSync('src/i18n/locales/zh-CN.js', 'utf-8')
      console.log(`  - zh-CN.js: ${content.length} 字节 [OK]`)
    } else {
      console.log('  - zh-CN.js: [缺失]')
    }

    if (enExists) {
      const content = fs.readFileSync('src/i18n/locales/en-US.js', 'utf-8')
      console.log(`  - en-US.js: ${content.length} 字节 [OK]`)
    } else {
      console.log('  - en-US.js: [缺失]')
    }

    return checks.languagePacksExist
  } catch (err) {
    console.error('✗ 检查语言包失败:', err.message)
    return false
  }
}

function checkEnvFiles() {
  try {
    const envExists = fs.existsSync('.env')
    const envProdExists = fs.existsSync('.env.production')

    console.log(`✓ .env文件: ${envExists ? '[存在]' : '[缺失]'}`)
    console.log(`✓ .env.production文件: ${envProdExists ? '[存在]' : '[缺失]'}`)

    checks.envFiles = envExists && envProdExists
    return checks.envFiles
  } catch (err) {
    console.error('✗ 检查环境文件失败:', err.message)
    return false
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(50))
  console.log('i18n修复验证结果')
  console.log('='.repeat(50))

  const checkList = [
    ['vue-i18n升级到稳定版', checks.vueI18nVersion],
    ['i18n/index.js配置优化', checks.i18nIndexFile],
    ['setupI18n.js初始化助手', checks.setupI18nFile],
    ['main.js集成初始化', checks.mainJsUpdated],
    ['vite.config.js构建优化', checks.viteConfigUpdated],
    ['语言包文件存在', checks.languagePacksExist],
    ['环境变量配置', checks.envFiles]
  ]

  let passCount = 0
  checkList.forEach(([name, passed]) => {
    console.log(`${passed ? '✓' : '✗'} ${name}`)
    if (passed) passCount++
  })

  console.log('='.repeat(50))
  console.log(`总体进度: ${passCount}/${checkList.length}`)

  if (passCount === checkList.length) {
    console.log('\n✓ 所有修复都已正确应用！')
    console.log('您可以安全地部署到Vercel了。')
  } else {
    console.log('\n⚠ 还有一些修复需要应用，请参考I18N_FIX_GUIDE.md')
  }
}

function main() {
  console.log('验证i18n修复...\n')

  checkVueI18nVersion()
  checkI18nIndexFile()
  checkSetupI18nFile()
  checkMainJsUpdated()
  checkViteConfigUpdated()
  console.log('\n检查语言包文件...')
  checkLanguagePacksExist()
  checkEnvFiles()

  printSummary()
}

main()
