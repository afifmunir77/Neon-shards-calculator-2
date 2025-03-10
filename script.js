const shardValues = {
  ovr98_99: 5,
  ovr100_102: 10,
  ovr103: 30,
  ovr104: 60,
  ovr105: 120,
  ovr106: 180,
  ovr107: 250,
};

let customRewards = [];
let dragSrcEl;

// DOM Elements
const customRewardsContainer = document.getElementById('customRewardsContainer');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('addMoreToggle').addEventListener('change', toggleAddMore);
  customRewardsContainer.addEventListener('dragover', handleDragOver);
}

function updateValue(id, change) {
  const input = document.getElementById(id);
  let value = parseInt(input.value) + change;
  value = Math.max(0, value);
  input.value = value;
  saveData();
  calculateTotal();
}

function calculateTotal() {
  let total = Object.entries(shardValues).reduce((sum, [key, val]) => {
    return sum + (parseInt(document.getElementById(key).value) * val);
  }, 0);

  total += parseInt(document.getElementById('others').value);
  total += parseInt(document.getElementById('dailyPack').value) * 10;

  customRewards.forEach(reward => {
    if (reward.checked) total += reward.shards;
  });

  document.getElementById('totalShards').textContent = `Total Shards: ${total}`;
}

function addCustomReward() {
  const name = document.getElementById('rewardName').value.trim();
  const shards = parseInt(document.getElementById('rewardShards').value);

  if (!name || isNaN(shards) || shards <= 0) {
    alert("Please enter valid reward details");
    return;
  }

  const newReward = {
    id: `reward_${Date.now()}`,
    name,
    shards,
    checked: true
  };

  customRewards.push(newReward);
  renderCustomReward(newReward);
  clearAddForm();
  saveData();
}

function renderCustomReward(reward) {
  const rewardDiv = document.createElement('div');
  rewardDiv.className = 'custom-reward';
  rewardDiv.draggable = true;
  rewardDiv.id = reward.id;
  
  rewardDiv.innerHTML = `
    <label>
      <input type="checkbox" checked>
      ${reward.name} (${reward.shards} Shards)
    </label>
    <button onclick="removeCustomReward('${reward.id}')">Remove</button>
  `;

  rewardDiv.querySelector('input').addEventListener('change', () => {
    reward.checked = !reward.checked;
    saveData();
    calculateTotal();
  });

  rewardDiv.addEventListener('dragstart', handleDragStart);
  rewardDiv.addEventListener('dragend', handleDragEnd);
  
  customRewardsContainer.appendChild(rewardDiv);
}

function removeCustomReward(id) {
  customRewards = customRewards.filter(r => r.id !== id);
  document.getElementById(id).remove();
  saveData();
  calculateTotal();
}

function toggleAddMore() {
  const section = document.getElementById('addMoreSection');
  section.style.display = document.getElementById('addMoreToggle').checked ? 'flex' : 'none';
}

function handleDragStart(e) {
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.outerHTML);
  setTimeout(() => this.classList.add('dragging'), 0);
}

function handleDragEnd() {
  this.classList.remove('dragging');
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  
  const target = e.target.closest('.custom-reward');
  if (target && target !== dragSrcEl) {
    const rect = target.getBoundingClientRect();
    const offset = e.clientY - rect.top;
    
    if (offset < rect.height / 2) {
      customRewardsContainer.insertBefore(dragSrcEl, target);
    } else {
      customRewardsContainer.insertBefore(dragSrcEl, target.nextSibling);
    }
    
    updateRewardsOrder();
  }
}

function updateRewardsOrder() {
  const orderedIds = Array.from(customRewardsContainer.children).map(el => el.id);
  customRewards.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id));
  saveData();
}

function clearAddForm() {
  document.getElementById('rewardName').value = '';
  document.getElementById('rewardShards').value = '';
}

function saveData() {
  const data = {
    ovr98_99: document.getElementById('ovr98_99').value,
    ovr100_102: document.getElementById('ovr100_102').value,
    ovr103: document.getElementById('ovr103').value,
    ovr104: document.getElementById('ovr104').value,
    ovr105: document.getElementById('ovr105').value,
    ovr106: document.getElementById('ovr106').value,
    ovr107: document.getElementById('ovr107').value,
    others: document.getElementById('others').value,
    dailyPack: document.getElementById('dailyPack').value,
    customRewards: customRewards,
  };
  
  localStorage.setItem('neonShardsData', JSON.stringify(data));
  calculateTotal();
}

function loadData() {
  const savedData = JSON.parse(localStorage.getItem('neonShardsData'));
  if (!savedData) return;

  Object.keys(shardValues).forEach(key => {
    document.getElementById(key).value = savedData[key] || 0;
  });

  document.getElementById('others').value = savedData.others || 0;
  document.getElementById('dailyPack').value = savedData.dailyPack || 0;

  customRewards = savedData.customRewards || [];
  customRewards.forEach(reward => renderCustomReward(reward));
  
  calculateTotal();
}
