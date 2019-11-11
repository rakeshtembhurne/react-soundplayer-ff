import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import './waveform.styles.css';

const NUMBER_OF_BUCKETS = 100;
const SPACE_BETWEEN_BARS = 0.2;

class Waveform extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bars: []
        };
        this.onSeek = this.onSeek.bind(this);
    }

    componentDidMount() {
        this.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
        let { mp3url, numberOfBuckets } = this.props;
        if (!numberOfBuckets) {
            numberOfBuckets = NUMBER_OF_BUCKETS;
        }
        fetch(mp3url)
            .then(response => response.arrayBuffer())
            .then(audioData => {
                this.audioCtx.decodeAudioData(
                    audioData,
                    buffer => {
                        let decodedAudioData = buffer.getChannelData(0);
                        let bucketDataSize = Math.floor(
                            decodedAudioData.length / numberOfBuckets
                        );
                        let buckets = [];
                        for (var i = 0; i < numberOfBuckets; i++) {
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

                        // FIXME: Only for debugging
                        const waweforms = bars.map(bar => bar.bucketSVGHeight);
                        console.log({waweforms});
                    },
                    e => {
                        // callback for any errors with decoding audio data
                        console.log(e);
                    }
                );
            })
            .catch(console.log);
    }

    onSeek(e) {
        e.persist();

        const { offsetWidth } = ReactDOM.findDOMNode(this);
        const xPos = (e.pageX - e.target.getBoundingClientRect().left) / offsetWidth;

        this.props.onSeekTrack(xPos);
    }

    render() {
        let { spaceBetweenBars, progress } = this.props;
        if (!spaceBetweenBars) {
            spaceBetweenBars = SPACE_BETWEEN_BARS;
        }
        return (
          <div className="ff-waveform">
            <svg
              viewBox="0 0 100 100"
              className="waveform-container"
              preserveAspectRatio="none"
              onClick={this.onSeek}
            >
            <rect className="waveform-bg" x="0" y="0" />
              <rect
                id="waveform-progress"
                className="waveform-progress"
                x="0"
                y="0"
                height="100"
                width={progress || 0}
              />
            </svg>
            <svg height="0" width="0">
              <defs>
                <clipPath id="waveform-mask">
                  {this.state.bars.map(
                    ({ bucketSVGHeight, bucketSVGWidth, index }) => (
                      <rect
                        key={index}
                        x={bucketSVGWidth * index + spaceBetweenBars / 2.0}
                        y={(100 - bucketSVGHeight) / 2.0}
                        width={bucketSVGWidth - spaceBetweenBars}
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

Waveform.propTypes = {
  mp3url: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
  onSeekTrack: PropTypes.func.isRequired,
  duration: PropTypes.number
};

export default Waveform;
