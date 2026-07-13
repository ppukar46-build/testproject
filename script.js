// Constants & State
const A4_HEIGHT = 1123;
let totalPages = 1;
let tabs = [];
let activeTabId = null;
let isDarkMode = false;
let isEyeCareMode = false;
let eyeCareIntensity = 50;

// Dynamic Paper Color Calculator
function getPaperColor() {
  if (!isEyeCareMode) return '#ffffff';
  
  // Maps the 0-100 slider to a lightness scale (98% off-white down to 82% deep sepia)
  const maxLightness = 98; 
  const minLightness = 82; 
  const lightness = maxLightness - ((eyeCareIntensity / 100) * (maxLightness - minLightness));
  
  return `hsl(40, 60%, ${lightness}%)`;
}

// Initialize Canvas
const canvas = new fabric.Canvas('studyCanvas', {
  backgroundColor: '#ffffff'
});

// -----------------------------------------
// 1. TAB & SUBJECT CONFIGURATION ENGINE
// -----------------------------------------
window.addEventListener('load', function() {
  // Load UI Theme Preference
  const savedTheme = localStorage.getItem('studyCanvasDarkMode');
  if (savedTheme === 'true') {
    isDarkMode = true;
    document.documentElement.classList.add('dark');
    document.getElementById('themeToggleBtn').innerText = '☀️';
  }

  // Load Eye-Care Intensity Preference
  const savedIntensity = localStorage.getItem('studyCanvasEyeCareIntensity');
  if (savedIntensity !== null) {
    eyeCareIntensity = parseInt(savedIntensity, 10);
    document.getElementById('eyeCareIntensity').value = eyeCareIntensity;
  }

  // Load Eye-Care Mode Preference
  const savedEyeCare = localStorage.getItem('studyCanvasEyeCare');
  if (savedEyeCare === 'true') {
    isEyeCareMode = true;
    document.getElementById('eyeCareToggleBtn').innerText = '📖';
    document.getElementById('eyeCareIntensity').classList.remove('hidden');
    canvas.backgroundColor = getPaperColor();
  }

  const savedTabs = localStorage.getItem('studyCanvasTabs');
  const savedActiveTabId = localStorage.getItem('studyCanvasActiveTabId');

  if (savedTabs) {
    tabs = JSON.parse(savedTabs);
  } else {
    const defaultId = 'tab_' + Date.now();
    tabs = [{ id: defaultId, name: 'Default Subject' }];
  }

  activeTabId = savedActiveTabId && tabs.find(t => t.id === savedActiveTabId) 
    ? savedActiveTabId 
    : tabs[0].id;

  renderTabs();
  loadTabData(activeTabId);
});

function renderTabs() {
  const container = document.getElementById('tabContainer');
  container.innerHTML = '';

  tabs.forEach(tab => {
    const isActive = tab.id === activeTabId;
    
    const tabEl = document.createElement('div');
    if (isActive) {
      tabEl.className = 'flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-medium cursor-pointer shadow-xs bg-blue-600 border-blue-600 text-white';
    } else {
      tabEl.className = 'flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-medium cursor-pointer transition-all bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600';
    }
    
    tabEl.setAttribute('onclick', `switchTab('${tab.id}')`);

    const nameSpan = document.createElement('span');
    nameSpan.innerText = tab.name;
    nameSpan.className = 'select-none';
    nameSpan.title = "Double-click tab to rename subject";
    tabEl.appendChild(nameSpan);

    tabEl.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      renameTab(tab.id);
    });

    if (tabs.length > 1) {
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '&times;';
      closeBtn.className = `ml-1 font-bold text-sm leading-none rounded-full w-4 h-4 flex items-center justify-center hover:bg-black/10 ${
        isActive ? 'text-white' : 'text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
      }`;
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        deleteTab(tab.id);
      };
      tabEl.appendChild(closeBtn);
    }

    container.appendChild(tabEl);
  });
}

function createNewTab() {
  const subjectName = prompt("Enter the name of the new subject:", "New Subject");
  if (!subjectName || !subjectName.trim()) return;

  silentSave(activeTabId);

  const newId = 'tab_' + Date.now();
  tabs.push({ id: newId, name: subjectName.trim() });
  activeTabId = newId;

  localStorage.setItem('studyCanvasTabs', JSON.stringify(tabs));
  localStorage.setItem('studyCanvasActiveTabId', activeTabId);

  renderTabs();
  
  canvas.clear();
  canvas.backgroundColor = getPaperColor();
  totalPages = 1;
  canvas.setHeight(A4_HEIGHT);
  canvas.renderAll();
}

function switchTab(id) {
  if (id === activeTabId) return;
  silentSave(activeTabId);
  activeTabId = id;
  localStorage.setItem('studyCanvasActiveTabId', activeTabId);
  renderTabs();
  loadTabData(activeTabId);
}

function renameTab(id) {
  const targetTab = tabs.find(t => t.id === id);
  if (!targetTab) return;
  const newName = prompt(`Rename subject "${targetTab.name}" to:`, targetTab.name);
  if (!newName || !newName.trim()) return;
  targetTab.name = newName.trim();
  localStorage.setItem('studyCanvasTabs', JSON.stringify(tabs));
  renderTabs();
}

function deleteTab(id) {
  if (confirm("Are you sure you want to delete this entire subject board? All saved progress within it will be lost.")) {
    const index = tabs.findIndex(t => t.id === id);
    if (index === -1) return;
    localStorage.removeItem(`canvasState_${id}`);
    localStorage.removeItem(`canvasPages_${id}`);
    tabs.splice(index, 1);
    if (activeTabId === id) activeTabId = tabs[0].id;
    localStorage.setItem('studyCanvasTabs', JSON.stringify(tabs));
    localStorage.setItem('studyCanvasActiveTabId', activeTabId);
    renderTabs();
    loadTabData(activeTabId);
  }
}

// -----------------------------------------
// 2. THEME & EYE-CARE ENGINES
// -----------------------------------------
function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  const btn = document.getElementById('themeToggleBtn');
  
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
    btn.innerText = '☀️';
  } else {
    document.documentElement.classList.remove('dark');
    btn.innerText = '🌙';
  }
  
  localStorage.setItem('studyCanvasDarkMode', isDarkMode);
}

function toggleEyeCare() {
  isEyeCareMode = !isEyeCareMode;
  const btn = document.getElementById('eyeCareToggleBtn');
  const slider = document.getElementById('eyeCareIntensity');
  
  if (isEyeCareMode) {
    btn.innerText = '📖';
    slider.classList.remove('hidden'); // Reveal slider
  } else {
    btn.innerText = '📄';
    slider.classList.add('hidden'); // Hide slider
  }
  
  localStorage.setItem('studyCanvasEyeCare', isEyeCareMode);
  canvas.backgroundColor = getPaperColor();
  canvas.renderAll();
}

// Triggered instantly as you drag the slider
function changeEyeCareIntensity(value) {
  eyeCareIntensity = parseInt(value, 10);
  localStorage.setItem('studyCanvasEyeCareIntensity', eyeCareIntensity);
  canvas.backgroundColor = getPaperColor();
  canvas.renderAll();
}

// -----------------------------------------
// 3. STORAGE & SAVE ENGINE
// -----------------------------------------
function loadTabData(id) {
  const state = localStorage.getItem(`canvasState_${id}`);
  const pages = localStorage.getItem(`canvasPages_${id}`);

  if (pages) {
    totalPages = parseInt(pages, 10);
    canvas.setHeight(A4_HEIGHT * totalPages);
  } else {
    totalPages = 1;
    canvas.setHeight(A4_HEIGHT);
  }

  canvas.clear();
  canvas.backgroundColor = getPaperColor(); 

  if (state) {
    canvas.loadFromJSON(state, function() {
      canvas.backgroundColor = getPaperColor();
      canvas.renderAll();
    });
  } else {
    canvas.renderAll();
  }
}

function silentSave(id) {
  try {
    const canvasData = canvas.toJSON();
    localStorage.setItem(`canvasState_${id}`, JSON.stringify(canvasData));
    localStorage.setItem(`canvasPages_${id}`, totalPages);
  } catch (e) {
    console.error("Silent storage configuration full!", e);
  }
}

function manualSave() {
  try {
    silentSave(activeTabId);
    const msg = document.getElementById('saveMessage');
    msg.style.opacity = '1';
    setTimeout(() => { msg.style.opacity = '0'; }, 2000);
  } catch (error) {
    console.error("Storage write overflow:", error);
    alert("Warning: Board elements are getting too massive to save! Please download your PDF immediately.");
  }
}

function clearCanvas() {
  if (confirm("Are you sure you want to delete everything inside this specific subject? This cannot be undone.")) {
    canvas.clear();
    canvas.backgroundColor = getPaperColor();
    totalPages = 1;
    canvas.setHeight(A4_HEIGHT);
    canvas.renderAll();
    
    localStorage.removeItem(`canvasState_${activeTabId}`);
    localStorage.setItem(`canvasPages_${activeTabId}`, 1);
  }
}

// -----------------------------------------
// 4. IMAGE PASTING
// -----------------------------------------
window.addEventListener('paste', function(e) {
  const items = (e.clipboardData || e.originalEvent.clipboardData).items;
  for (let item of items) {
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const blob = item.getAsFile();
      const reader = new FileReader();
      
      reader.onload = function(event) {
        const imgObj = new Image();
        imgObj.src = event.target.result;
        imgObj.onload = function() {
          const image = new fabric.Image(imgObj);
          
          if (image.width > 600) image.scaleToWidth(600);
          
          const scrollArea = document.getElementById('scrollArea');
          const currentScroll = scrollArea.scrollTop;
          
          image.set({
            left: canvas.width / 2 - (image.getScaledWidth() / 2),
            top: currentScroll + 100,
          });
          
          canvas.add(image);
          canvas.setActiveObject(image);
        }
      };
      reader.readAsDataURL(blob);
    }
  }
});

// -----------------------------------------
// 5. TEXT & STYLING CONTROLS
// -----------------------------------------
function addText() {
  const scrollArea = document.getElementById('scrollArea');
  const currentScroll = scrollArea.scrollTop;

  const text = new fabric.IText('Double-click to edit', {
    left: 100,
    top: currentScroll + 100,
    fontFamily: document.getElementById('fontFamily').value,
    fill: document.getElementById('colorPicker').value,
    fontSize: parseInt(document.getElementById('fontSize').value, 10),
  });
  canvas.add(text);
  canvas.setActiveObject(text);
}

canvas.on('mouse:dblclick', function(options) {
  if (!options.target) {
    const pointer = canvas.getPointer(options.e);
    const text = new fabric.IText('Type here', {
      left: pointer.x,
      top: pointer.y,
      fontFamily: document.getElementById('fontFamily').value,
      fill: document.getElementById('colorPicker').value,
      fontSize: parseInt(document.getElementById('fontSize').value, 10),
    });
    
    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
  }
});

function changeColor(color) {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type === 'i-text') {
    activeObject.set('fill', color);
    canvas.requestRenderAll();
  }
}

function changeFont(font) {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type === 'i-text') {
    activeObject.set('fontFamily', font);
    canvas.requestRenderAll();
  }
}

function changeSize(size) {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type === 'i-text') {
    activeObject.set('fontSize', parseInt(size, 10));
    canvas.requestRenderAll();
  }
}

function toggleBold() {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type === 'i-text') {
    const isBold = activeObject.fontWeight === 'bold';
    activeObject.set('fontWeight', isBold ? 'normal' : 'bold');
    canvas.requestRenderAll();
  }
}

function toggleItalic() {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type === 'i-text') {
    const isItalic = activeObject.fontStyle === 'italic';
    activeObject.set('fontStyle', isItalic ? 'normal' : 'italic');
    canvas.requestRenderAll();
  }
}

canvas.on('selection:created', updateToolbar);
canvas.on('selection:updated', updateToolbar);

function updateToolbar() {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type === 'i-text') {
    document.getElementById('fontFamily').value = activeObject.fontFamily || 'sans-serif';
    document.getElementById('fontSize').value = activeObject.fontSize || 24;
    document.getElementById('colorPicker').value = activeObject.fill || '#000000';
  }
}

// -----------------------------------------
// 6. REMOVING ELEMENTS
// -----------------------------------------
function deleteSelected() {
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length) {
    canvas.discardActiveObject();
    activeObjects.forEach(object => canvas.remove(object));
  }
}

window.addEventListener('keydown', function(e) {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    const activeObject = canvas.getActiveObject();
    if (activeObject && !activeObject.isEditing) {
      e.preventDefault();
      deleteSelected();
    }
  }
});

// -----------------------------------------
// 7. DYNAMIC BOARD DIMENSION EXTENSIONS
// -----------------------------------------
function extendCanvas() {
  totalPages += 1;
  canvas.setHeight(A4_HEIGHT * totalPages);
  canvas.renderAll();
  document.getElementById('scrollArea').scrollBy({ top: 300, behavior: 'smooth' });
}

function reduceCanvas() {
  if (totalPages <= 1) {
    alert("The canvas is already at its minimum size (1 page).");
    return;
  }
  totalPages -= 1;
  canvas.setHeight(A4_HEIGHT * totalPages);
  canvas.renderAll();
  document.getElementById('scrollArea').scrollBy({ top: -300, behavior: 'smooth' });
}

// -----------------------------------------
// 8. HIGH-FIDELITY PDF RENDERING ENGINE
// -----------------------------------------
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  
  canvas.discardActiveObject();
  
  // SECRET TRICK: Force the canvas to pure white strictly for the PDF snapshot
  const originalBg = canvas.backgroundColor;
  canvas.backgroundColor = '#ffffff';
  canvas.renderAll();
  
  const imgData = canvas.toDataURL({
    format: 'png',
    quality: 1,
    multiplier: 2
  });
  
  // Restore the original eye-care color immediately after the snapshot
  canvas.backgroundColor = originalBg;
  canvas.renderAll();
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = 210; 
  const pdfHeight = 297; 
  
  const totalImgHeightInMM = (canvas.getHeight() * pdfWidth) / canvas.getWidth();
  let heightLeft = totalImgHeightInMM;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeightInMM);
  heightLeft -= pdfHeight;

  while (heightLeft > 1) { 
    position -= pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeightInMM);
    heightLeft -= pdfHeight;
  }
  
  // const activeTab = tabs.find(t => t.id === activeTabId);
  // const fileName = activeTab ? activeTab.name.replace(/\s+/g, '_') : 'Study_Board';
  // pdf.save(`${fileName}_${new Date().toISOString().slice(0,10)}.pdf`);

  const activeTab = tabs.find(t => t.id === activeTabId);
  
  // Clean up the names by replacing spaces with underscores for a safe file name
  const tabName = activeTab ? activeTab.name.replace(/\s+/g, '_') : 'Subject';
  const siteTitle = document.title.replace(/\s+/g, '_'); 
  
  // Save the PDF as: Freeform_Study_Canvas_-_Your_Tab_Name.pdf
  pdf.save(`${siteTitle}_-_${tabName}.pdf`);
}
