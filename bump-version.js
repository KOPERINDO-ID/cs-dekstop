// bump-version.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Fungsi untuk membaca config.xml
function readConfigXml() {
    const configPath = path.join(__dirname, 'config.xml');
    return fs.readFileSync(configPath, 'utf8');
}

// Fungsi untuk menulis config.xml
function writeConfigXml(content) {
    const configPath = path.join(__dirname, 'config.xml');
    fs.writeFileSync(configPath, content, 'utf8');
}

// Fungsi untuk parsing versi dari config.xml
function parseVersion(configXml) {
    const versionMatch = configXml.match(/version="(\d+)\.(\d+)\.(\d+)"/);
    const androidCodeMatch = configXml.match(/android-versionCode="(\d+)"/);

    if (!versionMatch) {
        throw new Error('Version tidak ditemukan di config.xml');
    }

    return {
        major: parseInt(versionMatch[1]),
        minor: parseInt(versionMatch[2]),
        patch: parseInt(versionMatch[3]),
        androidCode: androidCodeMatch ? parseInt(androidCodeMatch[1]) : 1
    };
}

// Fungsi untuk update versi di config.xml
function updateVersion(configXml, newVersion, newAndroidCode) {
    let updated = configXml.replace(
        /version="\d+\.\d+\.\d+"/,
        `version="${newVersion.major}.${newVersion.minor}.${newVersion.patch}"`
    );

    // Update android-versionCode
    if (updated.includes('android-versionCode=')) {
        updated = updated.replace(
            /android-versionCode="\d+"/,
            `android-versionCode="${newAndroidCode}"`
        );
    } else {
        // Tambahkan jika belum ada
        updated = updated.replace(
            /<widget([^>]*?)>/,
            `<widget$1 android-versionCode="${newAndroidCode}">`
        );
    }

    // Update iOS CFBundleVersion (sama dengan version)
    if (updated.includes('ios-CFBundleVersion=')) {
        updated = updated.replace(
            /ios-CFBundleVersion="[^"]+"/,
            `ios-CFBundleVersion="${newVersion.major}.${newVersion.minor}.${newVersion.patch}"`
        );
    } else {
        updated = updated.replace(
            /<widget([^>]*?)>/,
            `<widget$1 ios-CFBundleVersion="${newVersion.major}.${newVersion.minor}.${newVersion.patch}">`
        );
    }

    return updated;
}

// Fungsi untuk update package.json
function updatePackageJson(newVersionString) {
    const packagePath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    packageJson.version = newVersionString;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
}

// Fungsi utama untuk bump version
function bumpVersion(type = 'patch', customVersion = null) {
    console.log(`🚀 Memulai version bump: ${type}\n`);

    // Baca config.xml
    const configXml = readConfigXml();
    const currentVersion = parseVersion(configXml);

    console.log(`📌 Versi saat ini: ${currentVersion.major}.${currentVersion.minor}.${currentVersion.patch}`);
    console.log(`📌 Android versionCode: ${currentVersion.androidCode}\n`);

    let newVersion = { ...currentVersion };

    // Tentukan versi baru
    if (customVersion) {
        const parts = customVersion.split('.');
        newVersion.major = parseInt(parts[0]);
        newVersion.minor = parseInt(parts[1]);
        newVersion.patch = parseInt(parts[2]);
    } else {
        switch (type) {
            case 'major':
                newVersion.major += 1;
                newVersion.minor = 0;
                newVersion.patch = 0;
                break;
            case 'minor':
                newVersion.minor += 1;
                newVersion.patch = 0;
                break;
            case 'patch':
            default:
                newVersion.patch += 1;
                break;
        }
    }

    // Increment android versionCode
    const newAndroidCode = currentVersion.androidCode + 1;

    const newVersionString = `${newVersion.major}.${newVersion.minor}.${newVersion.patch}`;

    console.log(`✅ Versi baru: ${newVersionString}`);
    console.log(`✅ Android versionCode baru: ${newAndroidCode}\n`);

    // Update config.xml
    const updatedConfigXml = updateVersion(configXml, newVersion, newAndroidCode);
    writeConfigXml(updatedConfigXml);
    console.log('✓ config.xml berhasil diupdate');

    // Update package.json
    updatePackageJson(newVersionString);
    console.log('✓ package.json berhasil diupdate\n');

    // Git commit (optional)
    try {
        execSync('git add config.xml package.json');
        execSync(`git commit -m "chore: bump version to ${newVersionString}"`);
        execSync(`git tag -a v${newVersionString} -m "Version ${newVersionString}"`);
        console.log(`✓ Git commit dan tag v${newVersionString} berhasil dibuat\n`);
    } catch (error) {
        console.log('⚠ Git commit gagal (mungkin tidak ada perubahan atau git tidak tersedia)\n');
    }

    console.log('🎉 Version bump selesai!');
    console.log(`\nJangan lupa push tag ke repository:`);
    console.log(`git push && git push --tags`);
}

// Ambil argumen dari command line
const args = process.argv.slice(2);
const type = args[0] || 'patch'; // patch, minor, major, atau custom version (1.2.3)

// Cek apakah custom version
if (type.match(/^\d+\.\d+\.\d+$/)) {
    bumpVersion('custom', type);
} else {
    bumpVersion(type);
}