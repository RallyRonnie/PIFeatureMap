PI Feature Map - SDK 2
=========================

## Overview

The SAFe PI Feature Map APP shows Features assigned to the selected PI as columns. The feature 
parent is displayed above the Feature if present. Child User Stories are cards in the 
columns. By default, the 'Project' field is used as swim lanes for Teams, but can be 
disabled in APP Settings.  

## Screen Shot

![Feature Map](https://github.com/RallyRonnie/PIFeatureMap/blob/master/screenshot.png)

## How to Use

You can use the APP at your ART or team level to breakdown and organize the program increment features.
Selecting a story ID will pop the quick details page (QDP) to the right to further complete any story details.

NOTE: If a row is not displayed, that indicates that there is not a User Story assigned to that Team.
You can select a User Story, and on the QDP, select the desired Project and it will now display on the 
board.

There are new APP options under the APP gear->Edit App Settings. Here is a screenshot below. You can configure:
* Card Fields - Pick the fields that appear on the story cards.
* Column Settings (These settings apply to the column header/title)
  * Column Header Font Size - size in pixels for header text (the cCunts are reduced by 4)
  * Show Parent - Show the ID and name of Feature parent item.
  * Color for Feature Title - Use Feature display color for the name text
  * Color for Parent Title - Use the parent display color for the parent name text
  * Show Counts - Display the Feature Estimate value and the roll-up story point counts
  * Sort By
    * Parent - Group the Features by the rank order of the Parent Item
    * Rank - Use the Feature rank from left to right
* Swimlanes
  * Team - Use the Project (Team) as swimlane
  * None - No swimlanes
* Query - applies to filtering user story cards on board if needed. See "query help" link.

![Story Map](https://raw.github.com/RallyRonnie/PIFeatureMap/master/settings.png)

### Running the App

If you want to start using the app immediately, create an Custom HTML app on your Rally dashboard. 
Then copy App.html from the deploy folder into the HTML text area. That's it, it should be ready 
to use. See [this](http://www.rallydev.com/help/use_apps#create) help link if you don't know how 
to create a dashboard page for Custom HTML apps.

Or you can just click [here](https://raw.github.com/RallyRonnie/PIFeatureMap/master/deploy/App.html) to find 
the file and copy it into the custom HTML app.

## License

AppTemplate is released under the MIT license.  See the file [LICENSE](./LICENSE) for the full text.

##Documentation for SDK

You can find the documentation on our help [site.](https://help.rallydev.com/apps/2.0/doc/)
