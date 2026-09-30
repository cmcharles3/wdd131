# STREAMING_CHUNK:Defining launcher script logic...
import os
import sys
import webview

def get_resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)

if __name__ == '__main__':
    html_path = get_resource_path("index.html")
    
    # Create native window embedding index.html
    window = webview.create_window(
        title='Cedar3 Technology - Workshop Management System',
        url=html_path,
        width=1280,
        height=850,
        resizable=True,
        min_size=(900, 600)
    )
    
    # Start native window engine
    webview.start(private_mode=False)
