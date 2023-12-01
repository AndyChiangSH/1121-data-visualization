var selected_feature = "popularity"
var selected_track_genre = "all"

const data_path = "spotify_tracks_preprocess.csv"

d3.csv(data_path, function (data) {
    // console.log("data:", data);

    // add an event listener for the change event
    const radioButtons = document.querySelectorAll('input[name="feature"]');
    for (const radioButton of radioButtons) {
        radioButton.addEventListener('change', change_feature);
    }

    function change_feature(e) {
        if (this.checked) {
            selected_feature = this.value;
            render();
        }
    }

    generate_select(data);
    function generate_select(data) {
        let track_genre_set = new Set(data.map(item => item["track_genre"]));
        let track_genre_array = [...track_genre_set];
        // console.log("track_genre_array:", track_genre_array)

        html = "<option value='all' selected>all</option>"
        for (let i = 0; i < track_genre_array.length; i++) {
            html += "<option value='" + track_genre_array[i] + "'>" + track_genre_array[i] + "</option>"
        }

        const track_genre_select = document.getElementById('track_genre_select');
        track_genre_select.innerHTML = html;
        track_genre_select.addEventListener("change", change_track_genre);
    }

    function change_track_genre(e) {
        selected_track_genre = this.value;
        render();
    }

    function render() {
        // console.log("render!");

        var wordcloud_data = []

        for (var i = 0; i < data.length; i++) {
            if (selected_track_genre == "all" || data[i]["track_genre"] == selected_track_genre) {
                let track_name = data[i]["track_name"];
                let value = +data[i][selected_feature];
                wordcloud_data.push([track_name, value]);
            }
        }

        console.log("wordcloud_data:", wordcloud_data);

        WordCloud(
            document.getElementById('my_wordcloud'),
            {
                list: wordcloud_data,
                minSize: 0,
                // drawOutOfBound: true,
                minRotation: 0,
                maxRotation: 0,
                rotationSteps: 1,
                shuffle: true,
                gridSize: 10,
                // classes: function (word, weight, fontSize, extraData) {
                //     console.log("word:", word)
                //     console.log("weight:", weight)
                //     console.log("this:", this)
                //     // this.title = weight;
                // },
                hover: function (item, dimension, event) {
                    // console.log("item:", item)
                    // console.log("dimension:", dimension)
                    // console.log("event:", event)

                    if (item != undefined) {
                        var element = event.srcElement
                        // console.log("element:", element)
                        element.title = item[0] + ": " + item[1]
                    }
                }
            },
        );
    }

    render();
});

