const fs = require('fs');

const testFiles = [
  'src/features/buildings/__tests__/floorGrouping.test.ts',
  'src/features/floors/__tests__/floorRepository.test.ts',
  'src/features/rooms/__tests__/roomRepository.test.ts',
  'src/features/beds/__tests__/bedRepository.test.ts'
];

for (const file of testFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add organizationId to mock data
    content = content.replace(/isActive: true,/g, 'isActive: true,\n      organizationId: "org123",');
    content = content.replace(/isActive: false,/g, 'isActive: false,\n      organizationId: "org123",');
    content = content.replace(/status: "vacant",/g, 'status: "vacant",\n      organizationId: "org123",');
    content = content.replace(/status: "occupied",/g, 'status: "occupied",\n      organizationId: "org123",');

    // Fix specific test expectations
    content = content.replace(/expect\(buildingRepository\.findById\)\.toHaveBeenCalledWith\("b-1"\);/g, 'expect(buildingRepository.findById).toHaveBeenCalledWith("org123", "b-1");');
    
    fs.writeFileSync(file, content);
  }
}
console.log('patched mock data in tests');

