import { useEffect } from 'react';

/**
 * Hook to hide the "Copy address" menu item from wallet dropdown
 * Uses a MutationObserver to watch for dropdown menu appearance and hides the first menu item
 */
export function useHideWalletCopyAddress() {
  useEffect(() => {
    // Function to hide copy address button
    const hideCopyAddressButton = () => {
      // Try multiple selectors to find the dropdown menu
      const dropdownLists = document.querySelectorAll(
        '.wallet-adapter-dropdown-list, .wallet-adapter-modal-list'
      );

      dropdownLists.forEach((list) => {
        // Get all list items
        const items = list.querySelectorAll('li');
        
        // Hide the first item (Copy address)
        if (items.length > 0) {
          const firstItem = items[0];
          firstItem.style.display = 'none';
          firstItem.style.visibility = 'hidden';
          firstItem.style.height = '0';
          firstItem.style.padding = '0';
          firstItem.style.margin = '0';
          firstItem.style.overflow = 'hidden';
          firstItem.style.pointerEvents = 'none';
        }
      });
    };

    // Call immediately in case menu already exists
    hideCopyAddressButton();

    // Set up MutationObserver to watch for dropdown appearance
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Check if dropdown list was added
        if (mutation.type === 'childList') {
          hideCopyAddressButton();
        }
      });
    });

    // Observe body for changes to dropdown menus
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    // Also set up a click listener on the wallet button to hide after menu opens
    const handleDocumentClick = () => {
      // Delay slightly to allow menu to render
      setTimeout(hideCopyAddressButton, 100);
    };

    document.addEventListener('click', handleDocumentClick);

    return () => {
      observer.disconnect();
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);
}
