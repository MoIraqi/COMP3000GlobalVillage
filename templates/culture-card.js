class CustomCultureCard extends HTMLElement {
    connectedCallback() {
        const culture = JSON.parse(this.getAttribute('data-culture'));

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .card {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                }
                .card-image {
                    height: 200px;
                    background-size: cover;
                    background-position: center;
                }
                .badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    background-color: #e0e7ff;
                    color: #4f46e5;
                }
                .detail-item {
                    margin-bottom: 8px;
                }
                .detail-title {
                    font-weight: 600;
                    color: #4f46e5;
                    margin-right: 4px;
                }
            </style>
            <div class="card culture-card">
                <div class="card-image" style="background-image: url('${culture.image}')"></div>
                <div class="p-5">
                    <div class="flex justify-between items-start mb-4">
                        <h2 class="text-xl font-bold text-gray-800">${culture.name}</h2>
                        <span class="badge">${culture.region}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-title">Foods:</span>
                        <span>${culture.foods.join(', ')}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-title">Holidays:</span>
                        <span>${culture.holidays.join(', ')}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-title">Music:</span>
                        <span>${culture.music.join(', ')}</span>
                    </div>
                    
                    <div class="flex justify-between mt-4">
                        <a href="#" class="text-blue-500 hover:underline">Learn More</a>
                        <div class="flex space-x-2">
                            <i data-feather="heart" class="text-gray-400 hover:text-red-500 cursor-pointer"></i>
                            <i data-feather="share-2" class="text-gray-400 hover:text-blue-500 cursor-pointer"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
customElements.define('custom-culture-card', CustomCultureCard);