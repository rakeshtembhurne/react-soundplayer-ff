import React from 'react';

import './wawelength.styles.css';

const DEFAULT_MP3 =
    "https://parse-server-ff.s3.amazonaws.com/ae5992f0f5bb1f259bafa41b3771e3bb_call12565815456dwwwwww795896232www-01b59bd3.mp3";
const NUMBER_OF_BUCKETS = 100;
const SPACE_BETWEEN_BARS = 0.2;

class Wawelength extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bars: [],
        }
    }

    componentDidMount() {
        this.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
        fetch(DEFAULT_MP3)
            .then(response => response.arrayBuffer())
            .then(audioData => {
                this.audioCtx.decodeAudioData(
                    audioData,
                    buffer => {
                        let decodedAudioData = buffer.getChannelData(0);
                        let bucketDataSize = Math.floor(
                            decodedAudioData.length / NUMBER_OF_BUCKETS
                        );
                        let buckets = [];
                        for (var i = 0; i < NUMBER_OF_BUCKETS; i++) {
                            let startingPoint = i * bucketDataSize;
                            let endingPoint =
                                i * bucketDataSize + bucketDataSize;
                            let max = 0;
                            for (var j = startingPoint; j < endingPoint; j++) {
                                if (decodedAudioData[j] > max) {
                                    max = decodedAudioData[j];
                                }
                            }
                            let size = Math.abs(max);
                            buckets.push(size / 2);
                        }
                        const bars = buckets.map((bucket, index) => ({
                            bucketSVGWidth: 100.0 / buckets.length,
                            bucketSVGHeight: bucket * 100.0,
                            index
                        }))
                        this.setState(state => ({...state, bars}))
                    },
                    e => {
                        // callback for any errors with decoding audio data
                        console.log("Error with decoding audio data" + e.err);
                    }
                );
            })
            .catch(console.log);
    }

    render() {
        return (
            <div className="wawelengh-container">
                <svg viewBox="0 0 100 100" className="waveform-container" preserveAspectRatio="none">
                    <rect className="waveform-bg" x="0" y="0" />
                    <rect id="waveform-progress" className="waveform-progress" x="0" y="0" height="100" width="0"/>
                </svg>
                <svg height="0" width="0">
                    <defs>
                        <clipPath id="waveform-mask">
                            {this.state.bars.map(
                        ({ bucketSVGHeight, bucketSVGWidth, index }) => (
                            <rect
                                key={index}
                                x={ bucketSVGWidth * index + SPACE_BETWEEN_BARS / 2.0 }
                                y={(100 - bucketSVGHeight) / 2.0}
                                width={bucketSVGWidth - SPACE_BETWEEN_BARS}
                                height={bucketSVGHeight}
                            />
                        )
                    )}
                        </clipPath>
                    </defs>
                </svg>
            </div>
        );
    }
}

export default Wawelength;
