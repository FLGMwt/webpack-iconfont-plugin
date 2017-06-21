import path from 'path';
import IconfontPlugin from '../';

const baseConfig = {
  svgs: path.resolve(__dirname, 'assets/svgs/**/*.svg'),
  fonts: path.resolve(__dirname, 'assets/fonts'),
  styles: path.resolve(__dirname, 'assets/scss')
};

describe('IconfontPlugin initialization', () => {
  it('should export `IconfontPlugin` as a class', () => {
    expect(typeof IconfontPlugin).toEqual('function');
  });

  it('should throw error if not passed `svgs`', () => {
    expect(() => { 
      new IconfontPlugin();
    }).toThrow();
  });

  it('should throw error if not passed `fonts`', () => {
    expect(() => {
      new IconfontPlugin({svgs: '**/*.svg'});
    }).toThrow();
  });

  it('should throw error if not passed `styles`', () => {
    expect(() => {
      new IconfontPlugin({
        svgs: '**/*.svg',
        fonts: './fonts',
      });
    }).toThrow();
  });

  it('should export options', () => {
    const plugin = new IconfontPlugin(baseConfig);
    expect(plugin.options).toEqual(baseConfig);
  });

  it('should register methods on apply', () => {
    const plugin = new IconfontPlugin(baseConfig);
    const compiler = {
      plugin: jest.fn()
    };
    plugin.apply(compiler);
    expect(compiler.plugin).toHaveBeenCalledWith('after-emit', plugin.watch);
    expect(compiler.plugin).toHaveBeenCalledWith('watch-run', plugin.compile),
    expect(compiler.plugin).toHaveBeenCalledWith('run', plugin.compile);
  });
});
