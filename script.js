// Constants & State
const A4_HEIGHT = 1123;
let totalPages = 1;
let tabs = [];
let activeTabId = null;
let isDarkMode = false;
let isEyeCareMode = false;
let eyeCareIntensity = 50;
let currentScale = 1; // Tracks mobile zoom level

function getPaperColor() {
  if (!isEyeCareMode) return '#ffffff';
  const maxLightness = 98; 
  const minLightness = 82; 
  const lightness = maxLightness - ((eyeCareIntensity / 100) * (maxLightness - minLightness));
  return `hsl(40, 60%, ${lightness}%)`;
}

const canvas = new fabric.Canvas('studyCanvas', {
  backgroundColor: '#ffffff'
});

// -----------------------------------------
// 1. MOBILE RESPONSIVENESS ENGINE
// -----------------------------------------
function adjustCanvasScale() {
  const scrollArea = document.getElementById('scrollArea');
  const wrapper = document.getElementById('canvasWrapper');
  const scaleContainer = document.getElementById('scaleContainer');
  
  // Calculate width accounting for padding
  const padding = window.innerWidth < 640 ? 32 : 64; 
  const availableWidth = scrollArea.clientWidth - padding;
  
  if (availableWidth < 794) {
    currentScale = availableWidth / 794;
    wrapper.style.transform = `scale(${currentScale})`;
    // Adjust the container height so the scrollbar perfectly matches the shrunken canvas
    scaleContainer.style.height = `${(A4_HEIGHT * totalPages) * currentScale}px`;
  } else {
    currentScale = 1;
    wrapper.style.transform = 'none';
    scaleContainer.style.height = 'auto';
  }
}

// Trigger responsive scaling on load and when device is rotated
window.addEventListener('resize', adjustCanvasScale);

// -----------------------------------------
// 2. TAB & SUBJECT CONFIGURATION ENGINE
// -----------------------------------------
window.addEventListener('load', function() {
  const savedTheme = localStorage.getItem('studyCanvasDarkMode');
  if (savedTheme === 'true') {
    isDarkMode = true;
    document.documentElement.classList.add('dark');
    document.getElementById('themeToggleBtn').innerText = '☀️';
  }

  const savedIntensity = localStorage.getItem('studyCanvasEyeCareIntensity');
  if (savedIntensity !== null) {
    eyeCareIntensity = parseInt(savedIntensity, 10);
    document.getElementById('eyeCareIntensity').value = eyeCareIntensity;
  }

  const savedEyeCare = localStorage.getItem('studyCanvasEyeCare');
  if (savedEyeCare === 'true') {
    isEyeCareMode = true;
    document.getElementById('eyeCareToggleBtn').innerText = '📖';
    document.getElementById('eyeCareIntensity').classList.remove('hidden');
    canvas.backgroundColor = getPaperColor();
  }

  const savedTabs = localStorage.getItem('studyCanvasTabs');
  const savedActiveTabId = localStorage.getItem('studyCanvasActiveTabId');

  if (savedTabs) tabs = JSON.parse(savedTabs);
  else tabs = [{ id: 'tab_' + Date.now(), name: 'Default Subject' }];

  activeTabId = savedActiveTabId && tabs.find(t => t.id === savedActiveTabId) 
    ? savedActiveTabId 
    : tabs[0].id;

  renderTabs();
  loadTabData(activeTabId);
  adjustCanvasScale(); // Scale immediately on load
});

function renderTabs() {
  const container = document.getElementById('tabContainer');
  container.innerHTML = '';

  tabs.forEach(tab => {
    const isActive = tab.id === activeTabId;
    const tabEl = document.createElement('div');
    
    if (isActive) {
      tabEl.className = 'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer shadow-xs bg-blue-600 border-blue-600 text-white whitespace-nowrap';
    } else {
      tabEl.className = 'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 whitespace-nowrap';
    }
    
    tabEl.setAttribute('onclick', `switchTab('${tab.id}')`);

    const nameSpan = document.createElement('span');
    nameSpan.innerText = tab.name;
    nameSpan.className = 'select-none';
    tabEl.appendChild(nameSpan);

    tabEl.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      renameTab(tab.id);
    });

    if (tabs.length > 1) {
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '&times;';
      closeBtn.className = `ml-1 font-bold text-sm leading-none rounded-full w-4 h-4 flex items-center justify-center hover:bg-black/10 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-400'}`;
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
  adjustCanvasScale();
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
  if (confirm("Are you sure you want to delete this subject?")) {
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
// 3. THEME & EYE-CARE ENGINES
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
    slider.classList.remove('hidden');
  } else {
    btn.innerText = '📄';
    slider.classList.add('hidden');
  }
  localStorage.setItem('studyCanvasEyeCare', isEyeCareMode);
  canvas.backgroundColor = getPaperColor();
  canvas.renderAll();
}

function changeEyeCareIntensity(value) {
  eyeCareIntensity = parseInt(value, 10);
  localStorage.setItem('studyCanvasEyeCareIntensity', eyeCareIntensity);
  canvas.backgroundColor = getPaperColor();
  canvas.renderAll();
}

// -----------------------------------------
// 4. STORAGE & SAVE ENGINE
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
      adjustCanvasScale(); 
    });
  } else {
    canvas.renderAll();
    adjustCanvasScale();
  }
}

function silentSave(id) {
  try {
    const canvasData = canvas.toJSON();
    localStorage.setItem(`canvasState_${id}`, JSON.stringify(canvasData));
    localStorage.setItem(`canvasPages_${id}`, totalPages);
  } catch (e) { console.error("Silent storage configuration full!", e); }
}

function manualSave() {
  try {
    silentSave(activeTabId);
    const msg = document.getElementById('saveMessage');
    msg.style.opacity = '1';
    setTimeout(() => { msg.style.opacity = '0'; }, 2000);
  } catch (error) {
    alert("Warning: Board is getting too massive to save! Download PDF immediately.");
  }
}

function clearCanvas() {
  if (confirm("Are you sure you want to delete everything inside this subject?")) {
    canvas.clear();
    canvas.backgroundColor = getPaperColor();
    totalPages = 1;
    canvas.setHeight(A4_HEIGHT);
    canvas.renderAll();
    localStorage.removeItem(`canvasState_${activeTabId}`);
    localStorage.setItem(`canvasPages_${activeTabId}`, 1);
    adjustCanvasScale();
  }
}

// -----------------------------------------
// 5. IMAGE INSERTION (PASTE & UPLOAD)
// -----------------------------------------
// Handles Ctrl+V for Desktop
window.addEventListener('paste', function(e) {
  const items = (e.clipboardData || e.originalEvent.clipboardData).items;
  for (let item of items) {
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      processImageFile(item.getAsFile());
    }
  }
});

// Handles Mobile Upload Button
function uploadImage(event) {
  const file = event.target.files[0];
  if (file) {
    processImageFile(file);
    event.target.value = ''; // Reset input so you can upload the same image again if needed
  }
}

function processImageFile(file) {
  const reader = new FileReader();
  reader.onload = function(event) {
    const imgObj = new Image();
    imgObj.src = event.target.result;
    imgObj.onload = function() {
      const image = new fabric.Image(imgObj);
      if (image.width > 600) image.scaleToWidth(600);
      
      const scrollArea = document.getElementById('scrollArea');
      // Accurately calculate scroll position on mobile scaled screens
      const currentScroll = scrollArea.scrollTop / currentScale;
      
      image.set({
        left: canvas.width / 2 - (image.getScaledWidth() / 2),
        top: currentScroll + 100,
      });
      
      canvas.add(image);
      canvas.setActiveObject(image);
    }
  };
  reader.readAsDataURL(file);
}

// -----------------------------------------
// 6. TEXT & STYLING CONTROLS
// -----------------------------------------
function addText() {
  const scrollArea = document.getElementById('scrollArea');
  const currentScroll = scrollArea.scrollTop / currentScale;

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
// 7. REMOVING ELEMENTS
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
// 8. DYNAMIC BOARD DIMENSION EXTENSIONS
// -----------------------------------------
function extendCanvas() {
  totalPages += 1;
  canvas.setHeight(A4_HEIGHT * totalPages);
  canvas.renderAll();
  adjustCanvasScale();
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
  adjustCanvasScale();
  document.getElementById('scrollArea').scrollBy({ top: -300, behavior: 'smooth' });
}

// -----------------------------------------
// 9. HIGH-FIDELITY PDF RENDERING ENGINE
// -----------------------------------------
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  
  canvas.discardActiveObject();
  
  const originalBg = canvas.backgroundColor;
  canvas.backgroundColor = '#ffffff';
  canvas.renderAll();
  
  const imgData = canvas.toDataURL({
    format: 'png',
    quality: 1,
    multiplier: 2
  });
  
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
  
  const activeTab = tabs.find(t => t.id === activeTabId);
  const tabName = activeTab ? activeTab.name.replace(/\s+/g, '_') : 'Subject';
  const siteTitle = document.title.replace(/\s+/g, '_'); 
  
  pdf.save(`${siteTitle}_-_${tabName}.pdf`);
}
