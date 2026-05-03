/**
 * Скрипт для экспорта иконок из Figma
 * Требуется: FIGMA_ACCESS_TOKEN в переменных окружения
 * 
 * Использование:
 * 1. Получите токен доступа Figma: https://www.figma.com/developers/api#access-tokens
 * 2. Установите переменную окружения: set FIGMA_ACCESS_TOKEN=your_token
 * 3. Запустите: node export-figma-icons.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const FIGMA_FILE_KEY = '6YEqoZmGzPM9sevyXOIt9G';
const FIGMA_NODE_ID = '88-438';
const OUTPUT_DIR = path.join(__dirname, 'assets', 'svg');

// Создаем папку, если её нет
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Токен доступа Figma
const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN || '';

if (!FIGMA_ACCESS_TOKEN) {
    console.error('❌ Ошибка: FIGMA_ACCESS_TOKEN не установлен!');
    console.log('\n📝 Инструкция:');
    console.log('1. Получите токен доступа: https://www.figma.com/developers/api#access-tokens');
    console.log('2. Установите переменную окружения:');
    console.log('   Windows: set FIGMA_ACCESS_TOKEN=your_token');
    console.log('   Mac/Linux: export FIGMA_ACCESS_TOKEN=your_token');
    console.log('3. Запустите скрипт снова');
    process.exit(1);
}

/**
 * Получить данные о файле из Figma
 */
function getFigmaFile() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.figma.com',
            path: `/v1/files/${FIGMA_FILE_KEY}?node_ids=${FIGMA_NODE_ID}`,
            method: 'GET',
            headers: {
                'X-Figma-Token': FIGMA_ACCESS_TOKEN
            }
        };

        https.get(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`Ошибка API: ${res.statusCode} - ${data}`));
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Найти фрейм "Icons" в дереве узлов
 */
function findIconsFrame(node) {
    const name = node.name ? node.name.toLowerCase() : '';
    
    // Проверяем, является ли это фреймом "Icons"
    if (node.type === 'FRAME' && (name === 'icons' || name.includes('icon'))) {
        return node;
    }

    // Ищем в дочерних элементах
    if (node.children) {
        for (const child of node.children) {
            const frame = findIconsFrame(child);
            if (frame) {
                return frame;
            }
        }
    }

    return null;
}

/**
 * Найти все иконки внутри фрейма "Icons"
 */
function findIconComponents(iconsFrame, icons = []) {
    if (!iconsFrame || !iconsFrame.children) {
        return icons;
    }

    // Проходим по всем дочерним элементам фрейма "Icons"
    iconsFrame.children.forEach(child => {
        const childName = child.name || '';
        
        // Экспортируем компоненты, инстансы, векторы и группы
        if (child.type === 'COMPONENT' || 
            child.type === 'INSTANCE' || 
            child.type === 'VECTOR' || 
            child.type === 'BOOLEAN_OPERATION' ||
            child.type === 'GROUP' ||
            child.type === 'FRAME') {
            
            // Если это группа или фрейм, ищем внутри них
            if (child.type === 'GROUP' || child.type === 'FRAME') {
                findIconComponents(child, icons);
            } else {
                // Это иконка - добавляем в список
                icons.push({
                    id: child.id,
                    name: childName || `icon-${child.id}`,
                    type: child.type
                });
            }
        }
    });

    return icons;
}

/**
 * Экспортировать иконку из Figma
 */
function exportIcon(nodeId, filename) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.figma.com',
            path: `/v1/images/${FIGMA_FILE_KEY}?ids=${nodeId}&format=svg`,
            method: 'GET',
            headers: {
                'X-Figma-Token': FIGMA_ACCESS_TOKEN
            }
        };

        https.get(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    const response = JSON.parse(data);
                    if (response.images && response.images[nodeId]) {
                        // Загружаем SVG файл
                        https.get(response.images[nodeId], (svgRes) => {
                            let svgData = '';
                            svgRes.on('data', (chunk) => {
                                svgData += chunk;
                            });
                            svgRes.on('end', () => {
                                const filePath = path.join(OUTPUT_DIR, filename);
                                fs.writeFileSync(filePath, svgData);
                                console.log(`✅ Экспортировано: ${filename}`);
                                resolve();
                            });
                        }).on('error', reject);
                    } else {
                        reject(new Error(`Иконка не найдена для ${nodeId}`));
                    }
                } else {
                    reject(new Error(`Ошибка экспорта: ${res.statusCode} - ${data}`));
                }
            });
        }).on('error', reject);
    });
}

/**
 * Основная функция
 */
async function main() {
    try {
        console.log('🔄 Загрузка данных из Figma...');
        const fileData = await getFigmaFile();
        
        console.log('🔍 Поиск фрейма "Icons"...');
        
        // Получаем узел по node_id
        let targetNode = null;
        if (fileData.nodes && fileData.nodes[FIGMA_NODE_ID]) {
            targetNode = fileData.nodes[FIGMA_NODE_ID].document;
        } else {
            // Если не нашли по node_id, ищем в document
            targetNode = fileData.document;
        }
        
        // Ищем фрейм "Icons"
        const iconsFrame = findIconsFrame(targetNode);
        
        if (!iconsFrame) {
            console.log('⚠️  Фрейм "Icons" не найден.');
            console.log('📋 Попробую экспортировать все элементы из указанного узла...');
            // Если не нашли фрейм "Icons", экспортируем все элементы из узла
            const icons = findIconComponents(targetNode);
            if (icons.length === 0) {
                console.log('❌ Иконки не найдены. Попробуйте экспортировать вручную:');
                console.log('1. Откройте Figma');
                console.log('2. Выберите иконки');
                console.log('3. Правый клик > Export > SVG');
                console.log('4. Сохраните в папку assets/svg/');
                return;
            }
            await exportIcons(icons);
            return;
        }
        
        console.log(`✅ Найден фрейм "Icons" (${iconsFrame.name})`);
        console.log('🔍 Поиск иконок внутри фрейма...');
        
        const icons = findIconComponents(iconsFrame);
        
        if (icons.length === 0) {
            console.log('⚠️  Иконки не найдены в фрейме "Icons".');
            console.log('💡 Убедитесь, что фрейм содержит компоненты или векторы.');
            return;
        }

        console.log(`📦 Найдено ${icons.length} иконок в фрейме "Icons"`);
        await exportIcons(icons);
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        if (error.stack) {
            console.error('Stack:', error.stack);
        }
        console.log('\n💡 Альтернативный способ:');
        console.log('1. Откройте Figma вручную');
        console.log('2. Выберите все иконки в фрейме "Icons"');
        console.log('3. Правый клик > Export > SVG');
        console.log('4. Сохраните файлы в папку assets/svg/');
    }
}

/**
 * Экспортировать список иконок
 */
async function exportIcons(icons) {
    const exportedFiles = new Set();
    let counter = 1;
    
    for (const icon of icons) {
        let filename = `${icon.name.replace(/\s+/g, '-').toLowerCase()}.svg`;
        
        // Очищаем имя файла от недопустимых символов
        filename = filename.replace(/[^a-z0-9\-_\.]/g, '');
        
        // Если файл с таким именем уже существует, добавляем номер
        if (exportedFiles.has(filename)) {
            const baseName = filename.replace('.svg', '');
            filename = `${baseName}-${counter}.svg`;
            counter++;
        }
        
        exportedFiles.add(filename);
        
        try {
            await exportIcon(icon.id, filename);
            // Небольшая задержка, чтобы не перегружать API
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`⚠️  Ошибка при экспорте ${icon.name}: ${error.message}`);
        }
    }
    
    console.log(`\n✨ Готово! Экспортировано ${icons.length} иконок в ${OUTPUT_DIR}`);
}

main();

