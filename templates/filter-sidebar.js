class CustomFilterSidebar extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .sidebar {
                    width: 280px;
                    background: white;
                    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
                }
                .filter-option {
                    padding: 10px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .filter-option.active {
                    background-color: #e0e7ff;
                    color: #4f46e5;
                    font-weight: 500;
                }
                .filter-section {
                    margin-bottom: 24px;
                }
                .filter-title {
                    font-weight: 600;
                    color: #4f46e5;
                    margin-bottom: 12px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #e5e7eb;
                }
            </style>
            <div class="sidebar p-6 hidden md:block">
                <h3 class="text-xl font-bold mb-6 text-gray-800">Filter Cultures</h3>
                
                <div class="filter-section">
                    <h4 class="filter-title">Regions</h4>
                    <div class="space-y-2">
                    <div class="filter-option" data-region="Asia">Asia (Japan, Korea, Turkey)</div>
                    <div class="filter-option" data-region="Africa">Africa (Morocco, South Africa)</div>
                    <div class="filter-option" data-region="Europe">Europe (Italy, Sweden, Greece)</div>
                    <div class="filter-option" data-region="North America">North America (Mexico, Canada)</div>
                    <div class="filter-option" data-region="South America">South America (Brazil, Peru)</div>
                    <div class="filter-option" data-region="Oceania">Oceania (Australia)</div>
                    <div class="filter-option" data-region="Arab">Arab World (Saudi, UAE, Egypt)</div>
<div class="filter-option active" data-region="">All Regions</div>
                    </div>
                </div>
                
                <div class="filter-section">
                    <h4 class="filter-title">Categories</h4>
                    <div class="space-y-2">
                        <div class="filter-option">Food</div>
                        <div class="filter-option">Music</div>
                        <div class="filter-option">Clothing</div>
                        <div class="filter-option">Traditions</div>
                        <div class="filter-option">Holidays</div>
                    </div>
                </div>
                
                <button class="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition">
                    Apply Filters
                </button>
            </div>
        `;

        // Add event listeners for filter options
        setTimeout(() => {
            const options = this.shadowRoot.querySelectorAll('.filter-option[data-region]');
            options.forEach(option => {
                option.addEventListener('click', () => {
                    // Remove active class from all options
                    options.forEach(opt => opt.classList.remove('active'));

                    // Add active class to clicked option
                    option.classList.add('active');

                    // Dispatch custom event with filter data
                    const region = option.getAttribute('data-region');
                    const event = new CustomEvent('filterChange', {
                        detail: { region }
                    });
                    document.dispatchEvent(event);
                });
            });
        }, 0);
    }
}
customElements.define('custom-filter-sidebar', CustomFilterSidebar);