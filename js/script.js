function switchTab(tabId) {
    // 1. Hide all tab contents
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(el => {
        el.classList.remove('active');
        el.style.display = 'none';
    });

    // 2. Show active tab
    const activeContent = document.getElementById('view-' + tabId);
    if(activeContent) {
        // Determine layout mode
        if(tabId === 'briefing') {
            activeContent.style.display = 'flex';
        } else {
            activeContent.style.display = 'grid';
        }
        
        // Add active class
        activeContent.classList.add('active');
        
        // 3. Trigger Animations on Children (Staggered)
        const tiles = activeContent.querySelectorAll('.tile-item');
        tiles.forEach((tile, index) => {
            // Reset animation
            tile.classList.remove('animate__animated', 'animate__fadeInUp');
            
            // Trigger reflow to restart animation
            void tile.offsetWidth; 
            
            // Add animation classes with staggered delay
            tile.style.animationDelay = `${index * 0.1}s`; // 0.1s stagger
            tile.classList.add('animate__animated', 'animate__fadeInUp');
        });
    }

    // 4. Update Button Styles
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => {
        // Reset to inactive style responsive (stacked on mobile, row on desktop)
        btn.className = "nav-btn w-full md:w-auto flex items-center justify-start md:justify-center gap-3 px-4 py-3 md:py-2 rounded-xl md:rounded-full transition-all duration-200 text-stone-300 hover:bg-white/10 hover:text-white cursor-pointer";
    });

    const activeBtn = document.getElementById('btn-' + tabId);
    if(activeBtn) {
        // Active style responsive
        activeBtn.className = "nav-btn w-full md:w-auto flex items-center justify-start md:justify-center gap-3 px-4 py-3 md:py-2 rounded-xl md:rounded-full transition-all duration-200 bg-orange-600 text-white shadow-md cursor-default";
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Icons
    lucide.createIcons();

    // Attach Event Listeners
    const btnProfile = document.getElementById('btn-profile');
    const btnStakeholders = document.getElementById('btn-stakeholders');
    const btnBriefing = document.getElementById('btn-briefing');

    if (btnProfile) btnProfile.addEventListener('click', () => switchTab('profile'));
    if (btnStakeholders) btnStakeholders.addEventListener('click', () => switchTab('stakeholders'));
    if (btnBriefing) btnBriefing.addEventListener('click', () => switchTab('briefing'));

    // Initialize default state
    switchTab('profile');
});