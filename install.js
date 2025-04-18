#!/usr/bin/env node

/**
 * Installation script for Ollama Web UI
 * This script installs and sets up the Ollama Web UI application
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🚀 Welcome to the Ollama Web UI Installer 🚀\n');
console.log('This script will install and set up the Ollama Web UI application.\n');

// Check if Ollama is installed and running
console.log('Checking if Ollama is installed and running...');

exec('curl -s http://localhost:11434/api/tags', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Could not connect to Ollama at http://localhost:11434');
    console.log('Please make sure Ollama is installed and running before continuing.');
    console.log('You can download Ollama from https://ollama.ai\n');
    
    rl.question('Do you want to continue anyway? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        continueInstallation();
      } else {
        console.log('\n❌ Installation aborted. Please install Ollama and try again.');
        rl.close();
      }
    });
  } else {
    console.log('✅ Ollama is running.');
    continueInstallation();
  }
});

function continueInstallation() {
  console.log('\nInstalling dependencies...');
  
  // Install dependencies
  const install = spawn('npm', ['run', 'install:all'], { shell: true, stdio: 'inherit' });
  
  install.on('close', (code) => {
    if (code !== 0) {
      console.log('\n❌ Error installing dependencies. Please check the error message above.');
      process.exit(1);
    }
    
    console.log('\n✅ Dependencies installed successfully.');
    
    // Build the application
    console.log('\nBuilding the application...');
    
    const build = spawn('npm', ['run', 'build'], { shell: true, stdio: 'inherit' });
    
    build.on('close', (code) => {
      if (code !== 0) {
        console.log('\n❌ Error building the application. Please check the error message above.');
        process.exit(1);
      }
      
      console.log('\n✅ Application built successfully.');
      
      // Ask if user wants to install globally
      rl.question('\nDo you want to install Ollama Web UI globally? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          // Install globally
          console.log('\nInstalling Ollama Web UI globally...');
          
          const globalInstall = spawn('npm', ['install', '-g', '.'], { shell: true, stdio: 'inherit' });
          
          globalInstall.on('close', (code) => {
            if (code !== 0) {
              console.log('\n❌ Error installing globally. Please check the error message above.');
              finishInstallation(false);
            } else {
              console.log('\n✅ Ollama Web UI installed globally successfully.');
              finishInstallation(true);
            }
          });
        } else {
          finishInstallation(false);
        }
      });
    });
  });
}

function finishInstallation(isGlobalInstall) {
  console.log('\n🎉 Installation completed! 🎉\n');
  
  if (isGlobalInstall) {
    console.log('You can now start Ollama Web UI by running:');
    console.log('  ollama-web-ui\n');
  } else {
    console.log('You can start Ollama Web UI by running:');
    console.log('  npm start\n');
    console.log('For development mode, run:');
    console.log('  npm run dev\n');
  }
  
  console.log('Thank you for installing Ollama Web UI!');
  rl.close();
} 