const fs = require('fs');
const orgId = 'org123';

const testFiles = [
  'src/features/buildings/__tests__/floorGrouping.test.ts',
  'src/features/floors/__tests__/floorRepository.test.ts',
  'src/features/rooms/__tests__/roomRepository.test.ts',
  'src/features/beds/__tests__/bedRepository.test.ts'
];

for (const file of testFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Naive replacement for repository calls in tests:
    content = content.replace(/buildingRepository\.create\(/g, 'buildingRepository.create(\"' + orgId + '\", ');
    content = content.replace(/buildingRepository\.update\(/g, 'buildingRepository.update(\"' + orgId + '\", ');
    content = content.replace(/buildingRepository\.deactivate\(/g, 'buildingRepository.deactivate(\"' + orgId + '\", ');
    content = content.replace(/buildingRepository\.getById\(/g, 'buildingRepository.getById(\"' + orgId + '\", ');
    content = content.replace(/buildingRepository\.findById\(/g, 'buildingRepository.findById(\"' + orgId + '\", ');
    content = content.replace(/buildingRepository\.getAll\(\)/g, 'buildingRepository.getAll(\"' + orgId + '\")');

    content = content.replace(/floorRepository\.create\(/g, 'floorRepository.create(\"' + orgId + '\", ');
    content = content.replace(/floorRepository\.update\(/g, 'floorRepository.update(\"' + orgId + '\", ');
    content = content.replace(/floorRepository\.deactivate\(/g, 'floorRepository.deactivate(\"' + orgId + '\", ');
    content = content.replace(/floorRepository\.getById\(/g, 'floorRepository.getById(\"' + orgId + '\", ');
    content = content.replace(/floorRepository\.findById\(/g, 'floorRepository.findById(\"' + orgId + '\", ');
    content = content.replace(/floorRepository\.getAllActive\(\)/g, 'floorRepository.getAllActive(\"' + orgId + '\")');
    content = content.replace(/floorRepository\.getByBuildingId\(/g, 'floorRepository.getByBuildingId(\"' + orgId + '\", ');

    content = content.replace(/roomRepository\.create\(/g, 'roomRepository.create(\"' + orgId + '\", ');
    content = content.replace(/roomRepository\.update\(/g, 'roomRepository.update(\"' + orgId + '\", ');
    content = content.replace(/roomRepository\.deactivate\(/g, 'roomRepository.deactivate(\"' + orgId + '\", ');
    content = content.replace(/roomRepository\.getById\(/g, 'roomRepository.getById(\"' + orgId + '\", ');
    content = content.replace(/roomRepository\.findById\(/g, 'roomRepository.findById(\"' + orgId + '\", ');
    content = content.replace(/roomRepository\.getAllActive\(\)/g, 'roomRepository.getAllActive(\"' + orgId + '\")');
    content = content.replace(/roomRepository\.getByFloorId\(/g, 'roomRepository.getByFloorId(\"' + orgId + '\", ');

    content = content.replace(/bedRepository\.create\(/g, 'bedRepository.create(\"' + orgId + '\", ');
    content = content.replace(/bedRepository\.update\(/g, 'bedRepository.update(\"' + orgId + '\", ');
    content = content.replace(/bedRepository\.deactivate\(/g, 'bedRepository.deactivate(\"' + orgId + '\", ');
    content = content.replace(/bedRepository\.getById\(/g, 'bedRepository.getById(\"' + orgId + '\", ');
    content = content.replace(/bedRepository\.findById\(/g, 'bedRepository.findById(\"' + orgId + '\", ');
    content = content.replace(/bedRepository\.getAllActive\(\)/g, 'bedRepository.getAllActive(\"' + orgId + '\")');
    content = content.replace(/bedRepository\.getByRoomId\(/g, 'bedRepository.getByRoomId(\"' + orgId + '\", ');
    content = content.replace(/bedRepository\.getByFloorId\(/g, 'bedRepository.getByFloorId(\"' + orgId + '\", ');

    fs.writeFileSync(file, content);
  }
}
console.log('patched test files');

