## SSUmap

### Setup
- Unpack SSUmap.zip

- Place the SSUmap folder in your public_html folder on blue (make sure your
      unpacking program didn't nest the SSUmap folder within an additional
      SSUmap folder)

- Go to https://blue.cs.sonoma.edu/~your_blue_login/SSUmap/index.html

### Usage
- Scroll and click+drag to free-zoom and free-pan, respectively.

- Click on a building to zoom in on the building and display the information
      tree with the building's departments expanded.

- Enter a search term into the search bar in the upper-right corner of the map
      to search the information tree for a match. If a match is found, the
      information beneath the match in the tree will be shown, and the building
      the match's sub-tree belongs to will be zoomed.
  - Partial, case-insensitive matches are supported

  - Only the first match is used, others are never reached

  - Examples:
    - Search "Ali" to expand the 'GMC Hospitality Center' and show
        'Kelly Kaslar', the only faculty associated with that department.
        Although the 'GMC Hospitality Center' is within the 'Music Center', no
        building will be zoomed as the 'Music Center' is not within the area
        covered by the map.
    - Search "shesh" to expand 'Ali Kooshesh', showing information associated
        with the faculty member. The map will also zoom in on 'Darwin Hall'
        because 'Ali Kooshesh' is under 'Computer Science' which is under
        'Darwin Hall'.

  - There are still some issues with things not displaying as expected when
      searching for one term, and then searching for another term within the
      same sub-tree as the previous term
