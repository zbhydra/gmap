import { createWriteStream } from 'fs'
import { join } from 'path'
import archiver from 'archiver'

/**
 * 打包产物目录为 zip（013 A13，U11 支持多渠道）。
 *
 * 用法：
 * - `node scripts/zip-dist.js`                 → dist        → dist.zip（默认，chrome 渠道，保持既有行为）
 * - `node scripts/zip-dist.js <dir> <out.zip>` → 指定目录    → 指定 zip（多渠道归档用）
 */

async function zipDirectory(source, outPath) {
  const archive = archiver('zip', { zlib: { level: 9 } })
  const stream = createWriteStream(outPath)

  return new Promise((resolve, reject) => {
    archive
      .glob('**/*', {
        cwd: source,
        dot: true,
        ignore: ['.DS_Store', '**/.DS_Store']
      })
      .on('error', err => reject(err))
      .pipe(stream)

    stream.on('close', () => resolve())
    archive.finalize()
  })
}

async function main() {
  try {
    const args = process.argv.slice(2)
    const distPath = join(process.cwd(), args[0] ?? 'dist')
    const zipPath = join(process.cwd(), args[1] ?? 'dist.zip')

    console.log(`正在压缩 ${args[0] ?? 'dist'} 目录...`)
    await zipDirectory(distPath, zipPath)
    console.log(`✅ 压缩完成: ${zipPath}`)
  } catch (error) {
    console.error('❌ 压缩失败:', error.message)
    process.exit(1)
  }
}

main()
