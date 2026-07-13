/* Make the scrollbar look like a modern native app */
.custom-scrollbar::-webkit-scrollbar {
    width: 12px;
    height: 12px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #fefeff; /* gray-300 to match the background */
    border-radius: 8px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #ce3b8a; /* gray-400 */
    border-radius: 8px;
    border: 3px solid #d1d5db; /* Creates a padded effect */
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #6b7280; /* gray-500 on hover */
}
