const input = document.querySelector('#favchap');
const button = document.querySelector('button');
const list = document.querySelector('#list');

function addChapter() {
    // Making sure the the input is not blank
    if (input.value.trim() !== '') {

        // Creating a li element
        const li = document.createElement('li');

        //Creating a delete button
        const deleteButton = document.createElement('button');

        li.textContent = input.value;
        deleteButton.textContent = 'X'

        // Add aria-label for screen readers
        deleteButton.setAttribute('aria-lable', `Remove ${input.value}`);

        // Add event listener to the delete button to remove the <li> when clicked
        deleteButton.addEventListener('click', function () {
            list.removeChild(li);
            input.focus();
        });

        li.append(deleteButton);

        // Unordered list
        list.append(li);

        // Clear input field for next entry
        input.value = '';

        // Focus the user back to the input field
        input.focus();

    }
}





